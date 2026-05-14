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

      // 2. Validar que los permisos a asignar no estén eliminados
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

      // 3. Crear permisos que no existen (solo los válidos/no eliminados)
      const permissionsToCreate = permissions.filter(
        (p) =>
          validPermissionIds.has(p.permisoId) &&
          !existingPermissionIds.has(p.permisoId),
      );

      for (const perm of permissionsToCreate) {
        await tx.usuarioPermisos.create({
          data: {
            usuarioId,
            permisoId: perm.permisoId,
            permitido: perm.permitido ?? true,
          },
        });
      }
    });
  }
}
