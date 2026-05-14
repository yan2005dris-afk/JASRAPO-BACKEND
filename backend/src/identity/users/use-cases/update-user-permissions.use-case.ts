import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

export interface UserDirectPermissionInput {
  permisoId: number;
  permitido?: boolean;
}

@Injectable()
export class UpdateUserPermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    usuarioId: number,
    permissions: UserDirectPermissionInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const user = await client.usuarios.findUnique({
      where: { usuarioId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const allExistingPermissions = await client.usuarioPermisos.findMany({
      where: { usuarioId },
      select: { permisoId: true, deletedAt: true, permitido: true },
    });

    const permissionState = new Map<
      number,
      { deletedAt: Date | null; permitido: boolean }
    >();
    for (const p of allExistingPermissions as any[]) {
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
    const newPermissionIds = new Set(deduplicatedPermissions.map((p) => p.permisoId));

    const run = async (innerTx: Prisma.TransactionClient) => {
      const permissionsToRemove = [...activePermissionIds].filter(
        (id) => !newPermissionIds.has(id),
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
        validPermissions.map((p) => p.permisoId),
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

    // Si ya viene dentro de una transacción externa, ejecutar directamente
    if (tx) {
      await run(tx);
    } else {
      await this.prisma.$transaction(run);
    }
  }
}
