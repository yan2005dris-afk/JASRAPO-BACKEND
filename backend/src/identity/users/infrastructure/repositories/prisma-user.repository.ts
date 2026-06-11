import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { paginate } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.UsuariosWhereUniqueInput,
    select?: Prisma.UsuariosSelect,
  ): Promise<any> {
    return this.prisma.usuarios.findUnique({ where, select });
  }

  async findFirst(
    where: Prisma.UsuariosWhereInput,
    select?: Prisma.UsuariosSelect,
  ): Promise<any> {
    return this.prisma.usuarios.findFirst({ where, select });
  }

  async findMany(params: {
    select?: Prisma.UsuariosSelect;
    where?: Prisma.UsuariosWhereInput;
    orderBy?: Prisma.UsuariosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.prisma.usuarios.findMany(params);
  }

  async findManyActive(
    pagination: PaginationDto,
    select?: Prisma.UsuariosSelect,
  ): Promise<{ data: any[]; meta: any }> {
    return paginate(
      this.prisma.usuarios,
      {
        select,
        where: { deletedAt: null },
        orderBy: { usuarioId: 'asc' },
      },
      {
        page: pagination.page,
        limit: pagination.limit,
      },
    );
  }

  async count(params: { where?: Prisma.UsuariosWhereInput }): Promise<number> {
    return this.prisma.usuarios.count(params);
  }

  async create(
    data: Prisma.UsuariosCreateInput | Prisma.UsuariosUncheckedCreateInput,
  ): Promise<any> {
    return this.prisma.usuarios.create({ data });
  }

  async update(
    where: Prisma.UsuariosWhereUniqueInput,
    data: Prisma.UsuariosUpdateInput | Prisma.UsuariosUncheckedUpdateInput,
    tx?: any,
  ): Promise<any> {
    const client = tx || this.prisma;
    return client.usuarios.update({ where, data });
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
