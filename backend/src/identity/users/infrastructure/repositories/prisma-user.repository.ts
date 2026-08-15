import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  UserRepository,
  CreateUserRepositoryData,
  UpdateUserRepositoryData,
  UserFilters,
  FiltroFecha,
  FailedLoginAttemptOptions,
  FailedLoginAttemptResult,
} from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { paginate } from 'src/infrastructure/common/utils/pagination.util';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

export const safeUserSelect = {
  usuarioId: true,
  email: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  avatar: true,
} satisfies Prisma.UsuariosSelect;

export const userWithRolesSelect = {
  usuarioId: true,
  email: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  avatar: true,
  deletedAt: true,
  rol: {
    select: {
      rolId: true,
      nombre: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.UsuariosSelect;

export const userWithPasswordAndLockoutSelect = {
  ...userWithRolesSelect,
  clave: true,
  intentosFallidos: true,
  ultimoIntentoFallidoEn: true,
  bloqueadoHasta: true,
} satisfies Prisma.UsuariosSelect;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
  ) {}

  private mapFiltroFecha(filter?: FiltroFecha | null) {
    if (filter === undefined) return undefined;
    if (filter === null) return null;
    if (filter.igualA !== undefined) return filter.igualA;
    return {
      lt: filter.antesDe,
      gt: filter.despuesDe,
    };
  }

  async findById(usuarioId: number): Promise<UserEntity | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      select: userWithRolesSelect,
    });
    return await this.userMapper.toWithRole(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: userWithRolesSelect,
    });
    return await this.userMapper.toWithRole(user);
  }

  async findByEmailWithPassword(email: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: userWithPasswordAndLockoutSelect,
    });
    return await this.userMapper.toWithPasswordAndLockout(user);
  }

  async findManyActive(
    pagination: PaginationDto,
  ): Promise<{ data: UserEntity[]; meta: any }> {
    const result = await paginate(
      this.prisma.usuarios,
      {
        select: userWithRolesSelect,
        where: { deletedAt: null },
        orderBy: { usuarioId: 'asc' },
      },
      {
        page: pagination.page,
        limit: pagination.limit,
      },
    );

    const data = await Promise.all(
      (result.data as any[]).map((user) => this.userMapper.toWithRole(user)),
    );

    return {
      data: data.filter((u): u is UserEntity => u !== null),
      meta: result.meta,
    };
  }

  async findMany(
    filters: UserFilters,
    pagination: PaginationDto,
  ): Promise<{ data: UserEntity[]; meta: any }> {
    const where: Prisma.UsuariosWhereInput = {
      ...(filters.email && { email: filters.email }),
      ...(filters.deletedAt !== undefined && {
        deletedAt: this.mapFiltroFecha(filters.deletedAt),
      }),
    };
    const result = await paginate(
      this.prisma.usuarios,
      {
        select: userWithRolesSelect,
        where,
        orderBy: { usuarioId: 'asc' },
      },
      {
        page: pagination.page,
        limit: pagination.limit,
      },
    );

    const data = await Promise.all(
      (result.data as any[]).map((user) => this.userMapper.toWithRole(user)),
    );

    return {
      data: data.filter((u): u is UserEntity => u !== null),
      meta: result.meta,
    };
  }

  async create(data: CreateUserRepositoryData): Promise<UserEntity> {
    const { rolId, ...userData } = data;
    const createData: Prisma.UsuariosCreateInput = {
      ...userData,
      avatar: userData.avatar as Prisma.InputJsonValue,
      rol: { connect: { rolId } },
    };
    const user = await this.prisma.usuarios.create({
      data: createData,
      select: userWithRolesSelect,
    });
    const mapped = await this.userMapper.toWithRole(user);
    if (!mapped) {
      throw new Error(
        `Error al mapear el usuario creado (ID: ${user.usuarioId})`,
      );
    }
    return mapped;
  }

  async update(
    usuarioId: number,
    data: UpdateUserRepositoryData,
    tx?: any,
  ): Promise<UserEntity> {
    const client = tx || this.prisma;
    const { rolId, ...userData } = data;
    const updateData: Prisma.UsuariosUpdateInput = {
      ...userData,
      avatar:
        userData.avatar !== undefined
          ? (userData.avatar as Prisma.InputJsonValue)
          : undefined,
      rol: rolId ? { connect: { rolId } } : undefined,
    };
    const user = await client.usuarios.update({
      where: { usuarioId },
      data: updateData,
      select: userWithRolesSelect,
    });
    const mapped = await this.userMapper.toWithRole(user);
    if (!mapped) {
      throw new Error(
        `Error al mapear el usuario actualizado (ID: ${usuarioId})`,
      );
    }
    return mapped;
  }

  async findDirectPermissions(usuarioId: number): Promise<any[]> {
    return this.prisma.usuarioPermisos.findMany({
      where: {
        usuarioId,
        deletedAt: null,
        permiso: { deletedAt: null },
      },
      orderBy: [
        { permiso: { recurso: 'asc' } },
        { permiso: { accion: 'asc' } },
      ],
      include: {
        permiso: { select: { permisoId: true, recurso: true, accion: true } },
      },
    });
  }

  async findRolePermissions(rolId: number): Promise<any[]> {
    return this.prisma.rolPermisos.findMany({
      where: {
        rolId,
        deletedAt: null,
        permiso: { deletedAt: null },
      },
      include: { permiso: { select: { recurso: true, accion: true } } },
    });
  }

  async updatePermissions(
    usuarioId: number,
    permissions: { permisoId: number; permitido?: boolean }[],
    tx?: any,
  ): Promise<void> {
    const client = tx || this.prisma;

    const allExistingPermissions = await client.usuarioPermisos.findMany({
      where: { usuarioId },
      select: { permisoId: true, deletedAt: true, permitido: true },
    });

    const permissionState = new Map<
      number,
      { deletedAt: Date | null; permitido: boolean }
    >();
    for (const p of allExistingPermissions) {
      permissionState.set(p.permisoId, {
        deletedAt: p.deletedAt,
        permitido: p.permitido,
      });
    }

    const activePermissionIds = new Set(
      allExistingPermissions
        .filter((p) => p.deletedAt === null)
        .map((p) => p.permisoId),
    );

    // Deduplicar por permisoId — último valor gana en caso de duplicados
    const deduplicatedPermissions = [
      ...new Map(permissions.map((p) => [p.permisoId, p])).values(),
    ];
    const newPermissionIds = new Set(
      deduplicatedPermissions.map((p) => p.permisoId),
    );

    const run = async (innerTx: any) => {
      const permissionsToRemove = [...activePermissionIds].filter(
        (id) => !newPermissionIds.has(id as number),
      );

      if (permissionsToRemove.length > 0) {
        await innerTx.usuarioPermisos.updateMany({
          where: {
            usuarioId,
            permisoId: { in: permissionsToRemove },
            deletedAt: null,
          },
          data: { deletedAt: new Date() },
        });
      }

      const validPermissions = await innerTx.permisos.findMany({
        where: {
          permisoId: { in: deduplicatedPermissions.map((p) => p.permisoId) },
          deletedAt: null,
        },
        select: { permisoId: true },
      });
      const validPermissionIds = new Set(
        validPermissions.map((p: any) => p.permisoId),
      );

      const invalidIds = deduplicatedPermissions
        .map((p) => p.permisoId)
        .filter((id) => !validPermissionIds.has(id));

      if (invalidIds.length > 0) {
        throw new EntityNotFoundException('Permisos', invalidIds.join(', '));
      }

      for (const perm of deduplicatedPermissions) {
        const state = permissionState.get(perm.permisoId);

        if (state === undefined) {
          await innerTx.usuarioPermisos.create({
            data: {
              usuarioId,
              permisoId: perm.permisoId,
              permitido: perm.permitido ?? true,
            },
          });
        } else if (state.deletedAt !== null) {
          await innerTx.usuarioPermisos.update({
            where: {
              usuarioId_permisoId: {
                usuarioId,
                permisoId: perm.permisoId,
              },
            },
            data: {
              deletedAt: null,
              permitido: perm.permitido ?? true,
            },
          });
        } else {
          const newPermitido = perm.permitido ?? true;
          if (state.permitido !== newPermitido) {
            await innerTx.usuarioPermisos.update({
              where: {
                usuarioId_permisoId: {
                  usuarioId,
                  permisoId: perm.permisoId,
                },
              },
              data: {
                permitido: newPermitido,
              },
            });
          }
        }
      }
    };

    if (tx) {
      await run(tx);
    } else {
      await this.prisma.$transaction(run);
    }
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async recordFailedLoginAttempt(
    usuarioId: number,
    options: FailedLoginAttemptOptions,
  ): Promise<FailedLoginAttemptResult> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.usuarios.findUnique({
        where: { usuarioId },
        select: {
          intentosFallidos: true,
          ultimoIntentoFallidoEn: true,
          bloqueadoHasta: true,
        },
      });

      if (!current) {
        throw new Error(
          `Usuario no encontrado al registrar intento fallido: ${usuarioId}`,
        );
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - options.windowMs);
      const isInWindow =
        current.ultimoIntentoFallidoEn !== null &&
        current.ultimoIntentoFallidoEn >= windowStart;
      const nextCount = isInWindow ? current.intentosFallidos + 1 : 1;
      const shouldLockout = nextCount >= options.threshold;

      // Limpia bloqueos ya expirados para no mostrar fechas pasadas como activas.
      const clearedBloqueadoHasta =
        current.bloqueadoHasta !== null && current.bloqueadoHasta <= now
          ? null
          : current.bloqueadoHasta;

      const updated = await tx.usuarios.update({
        where: { usuarioId },
        data: shouldLockout
          ? {
              intentosFallidos: 0,
              ultimoIntentoFallidoEn: now,
              bloqueadoHasta: new Date(
                now.getTime() + options.lockoutDurationMs,
              ),
            }
          : {
              intentosFallidos: nextCount,
              ultimoIntentoFallidoEn: now,
              bloqueadoHasta: clearedBloqueadoHasta,
            },
        select: {
          intentosFallidos: true,
          bloqueadoHasta: true,
        },
      });

      return updated;
    });
  }

  async clearFailedLoginAttempts(usuarioId: number): Promise<void> {
    await this.prisma.usuarios.update({
      where: { usuarioId },
      data: {
        intentosFallidos: 0,
        ultimoIntentoFallidoEn: null,
        bloqueadoHasta: null,
      },
    });
  }
}
