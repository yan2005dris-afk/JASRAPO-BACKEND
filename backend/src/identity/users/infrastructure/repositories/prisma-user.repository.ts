import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  UserRepository,
  CreateUserRepositoryData,
  UpdateUserRepositoryData,
  UserFilters,
  FiltroFecha,
} from '../../domain/repositories/user.repository';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { paginate } from 'src/infrastructure/common/utils/pagination.util';
import { userWithRolesSelect, UserWithRoleResponse } from '../../domain/types/user.types';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapFiltroFecha(filter?: FiltroFecha | null) {
    if (filter === undefined) return undefined;
    if (filter === null) return null;
    if (filter.igualA !== undefined) return filter.igualA;
    return {
      lt: filter.antesDe,
      gt: filter.despuesDe,
    };
  }

  async findById(usuarioId: number): Promise<UserWithRoleResponse | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      select: userWithRolesSelect,
    });
    return UserMapper.toWithRole(user);
  }

  async findByEmail(email: string): Promise<UserWithRoleResponse | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: userWithRolesSelect,
    });
    return UserMapper.toWithRole(user);
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<(UserWithRoleResponse & { clave: string }) | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: {
        ...userWithRolesSelect,
        clave: true,
      },
    });
    return UserMapper.toWithRoleAndClave(user);
  }

  async findManyActive(
    pagination: PaginationDto,
  ): Promise<{ data: UserWithRoleResponse[]; meta: any }> {
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
    return {
      data: (result.data as any[]).map((user) => UserMapper.toWithRole(user)!),
      meta: result.meta,
    };
  }

  async findMany(
    filters: UserFilters,
    pagination: PaginationDto,
  ): Promise<{ data: UserWithRoleResponse[]; meta: any }> {
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
    return {
      data: (result.data as any[]).map((user) => UserMapper.toWithRole(user)!),
      meta: result.meta,
    };
  }

  async create(data: CreateUserRepositoryData): Promise<UserWithRoleResponse> {
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
    return UserMapper.toWithRole(user)!;
  }

  async update(
    usuarioId: number,
    data: UpdateUserRepositoryData,
    tx?: any,
  ): Promise<UserWithRoleResponse> {
    const client = tx || this.prisma;
    const { rolId, ...userData } = data;
    const updateData: Prisma.UsuariosUpdateInput = {
      ...userData,
      avatar: userData.avatar !== undefined ? (userData.avatar as Prisma.InputJsonValue) : undefined,
      rol: rolId ? { connect: { rolId } } : undefined,
    };
    const user = await client.usuarios.update({
      where: { usuarioId },
      data: updateData,
      select: userWithRolesSelect,
    });
    return UserMapper.toWithRole(user)!;
  }

  async findRoleById(rolId: number): Promise<any> {
    return this.prisma.roles.findUnique({ where: { rolId } });
  }

  async findRoleByName(nombre: string): Promise<any> {
    return this.prisma.roles.findFirst({
      where: { nombre, deletedAt: null },
    });
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
        throw new BadRequestException(
          `Permisos no encontrados o eliminados: ${invalidIds.join(', ')}`,
        );
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
}
