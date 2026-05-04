import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetEffectivePermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      include: {
        rol: { select: { rolId: true, deletedAt: true } },
        permisosUsuario: {
          where: { deletedAt: null },
          include: { permiso: true },
        },
      },
    });

    if (!usuario || usuario.deletedAt) {
      throw new NotFoundException('Usuario eliminado o no encontrado');
    }

    const rolId =
      usuario.rol && !usuario.rol.deletedAt ? usuario.rol.rolId : null;

    const rolePermissionAssignments = !rolId
      ? []
      : await this.prisma.rolPermisos.findMany({
          where: {
            deletedAt: null,
            rolId: rolId,
            permiso: { deletedAt: null },
          },
          include: {
            permiso: { select: { recurso: true, accion: true } },
          },
        });

    const effectivePermissionsMap = new Map<string, boolean>();

    rolePermissionAssignments.forEach((rp) => {
      effectivePermissionsMap.set(
        `${rp.permiso.recurso}:${rp.permiso.accion}`,
        true,
      );
    });

    usuario.permisosUsuario.forEach((up) => {
      if (up.permiso && !up.permiso.deletedAt) {
        const key = `${up.permiso.recurso}:${up.permiso.accion}`;
        if (up.permitido) {
          effectivePermissionsMap.set(key, true);
        } else {
          effectivePermissionsMap.delete(key);
        }
      }
    });

    return Array.from(effectivePermissionsMap.keys()).map((key) => {
      const [resource, action] = key.split(':');
      return { resource, action };
    });
  }
}
