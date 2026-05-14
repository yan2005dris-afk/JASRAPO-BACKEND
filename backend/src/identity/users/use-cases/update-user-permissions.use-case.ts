import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<void> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    // Obtener TODOS los permisos directos del usuario (incluidos eliminados)
    // para determinar si una relación existe o fue soft-deleted
    const allExistingPermissions = await this.prisma.usuarioPermisos.findMany({
      where: { usuarioId },
      select: { permisoId: true, deletedAt: true, permitido: true },
    });

    // Mapa de permisoId -> { deletedAt, permitido } (null = activo, no null = eliminado)
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
    const newPermissionIds = new Set(permissions.map((p) => p.permisoId));

    // Transacción para actualizar permisos
    await this.prisma.$transaction(async (tx) => {
      // 1. Desactivar permisos activos que ya no vienen en la lista (soft delete)
      const permissionsToRemove = [...activePermissionIds].filter(
        (id) => !newPermissionIds.has(id),
      );

      if (permissionsToRemove.length > 0) {
        await tx.usuarioPermisos.updateMany({
          where: {
            usuarioId,
            permisoId: { in: permissionsToRemove },
            deletedAt: null,
          },
          data: { deletedAt: new Date() },
        });
      }

      // 2. Validar que los permisos a asignar no estén eliminados (el permiso maestro existe)
      const validPermissions = await tx.permisos.findMany({
        where: {
          permisoId: { in: permissions.map((p) => p.permisoId) },
          deletedAt: null,
        },
        select: { permisoId: true },
      });
      const validPermissionIds = new Set(
        validPermissions.map((p) => p.permisoId),
      );

      // 3. Upsert: crear o restaurar permisos
      // - Si no existe relación -> crear
      // - Si existe pero está eliminado (soft delete) -> restaurar (set deletedAt: null)
      // - Si existe y está activo -> actualizar permitido si cambió
      for (const perm of permissions) {
        if (!validPermissionIds.has(perm.permisoId)) {
          continue; // Skip invalid permissions
        }

        const state = permissionState.get(perm.permisoId);

        if (state === undefined) {
          // No existe relación -> crear nuevo
          await tx.usuarioPermisos.create({
            data: {
              usuarioId,
              permisoId: perm.permisoId,
              permitido: perm.permitido ?? true,
            },
          });
        } else if (state.deletedAt !== null) {
          // Existe pero fue soft-deleted -> restaurar
          await tx.usuarioPermisos.update({
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
          // Existe y ya está activo -> actualizar solo si 'permitido' cambió
          const newPermitido = perm.permitido ?? true;
          if (state.permitido !== newPermitido) {
            await tx.usuarioPermisos.update({
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
    });
  }
}
