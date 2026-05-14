import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

export interface UserDirectPermission {
  usuarioPermisoId: number;
  permisoId: number;
  recurso: string;
  accion: string;
  permitido: boolean;
}

@Injectable()
export class GetUserDirectPermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number): Promise<UserDirectPermission[]> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const assignments = await this.prisma.usuarioPermisos.findMany({
      where: { usuarioId, deletedAt: null, permiso: { deletedAt: null } },
      orderBy: [
        { permiso: { recurso: 'asc' } },
        { permiso: { accion: 'asc' } },
      ],
      include: {
        permiso: {
          select: { permisoId: true, recurso: true, accion: true },
        },
      },
    });

    return assignments.map((assignment) => ({
      usuarioPermisoId: assignment.usuarioPermisoId,
      permisoId: assignment.permisoId,
      recurso: assignment.permiso.recurso,
      accion: assignment.permiso.accion,
      permitido: assignment.permitido,
    }));
  }
}