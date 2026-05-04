import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class AssignPermissionToUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number, permisoId: number, permitido = true) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
    });
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const permiso = await this.prisma.permisos.findUnique({
      where: { permisoId },
    });
    if (!permiso || permiso.deletedAt)
      throw new NotFoundException('Permiso no encontrado o eliminado');

    const existing = await this.prisma.usuarioPermisos.findFirst({
      where: { usuarioId, permisoId, deletedAt: null },
    });

    if (existing) {
      return this.prisma.usuarioPermisos.update({
        where: { usuarioPermisoId: existing.usuarioPermisoId },
        data: { permitido },
      });
    }

    return this.prisma.usuarioPermisos.create({
      data: { usuarioId, permisoId, permitido },
    });
  }
}
