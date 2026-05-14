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

    // Obtener permisos directos actuales del usuario
    const existingPermissions = await this.prisma.usuarioPermisos.findMany({
      where: { usuarioId, deletedAt: null },
      select: { permisoId: true },
    });

    const existingPermissionIds = new Set(
      existingPermissions.map((p) => p.permisoId),
    );
    const newPermissionIds = new Set(permissions.map((p) => p.permisoId));

    // Transacción para actualizar permisos
    await this.prisma.$transaction(async (tx) => {
      // 1. Desactivar permisos que ya no vienen en la lista (soft delete)
      const permissionsToRemove = [...existingPermissionIds].filter(
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

      // 2. Crear o actualizar permisos
      for (const perm of permissions) {
        const exists = existingPermissionIds.has(perm.permisoId);

        if (exists) {
          // Verificar que el permiso existe y no está eliminado
          const existing = await tx.usuarioPermisos.findFirst({
            where: {
              usuarioId,
              permisoId: perm.permisoId,
              deletedAt: null,
            },
          });

          if (existing && existing.permitido !== perm.permitido) {
            await tx.usuarioPermisos.update({
              where: { usuarioPermisoId: existing.usuarioPermisoId },
              data: { permitido: perm.permitido ?? true },
            });
          }
        } else {
          // Crear nuevo permiso directo
          await tx.usuarioPermisos.create({
            data: {
              usuarioId,
              permisoId: perm.permisoId,
              permitido: perm.permitido ?? true,
            },
          });
        }
      }
    });
  }
}
