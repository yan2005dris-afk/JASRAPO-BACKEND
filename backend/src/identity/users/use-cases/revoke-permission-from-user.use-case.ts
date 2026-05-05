import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RevokePermissionFromUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioPermisoId: number) {
    const usuarioPermiso = await this.prisma.usuarioPermisos.findUnique({
      where: { usuarioPermisoId },
    });

    if (!usuarioPermiso)
      throw new NotFoundException('Asignación de permiso no encontrada');
    if (usuarioPermiso.deletedAt)
      throw new ConflictException('Este permiso ya fue revocado previamente');

    return this.prisma.usuarioPermisos.update({
      where: { usuarioPermisoId },
      data: { deletedAt: new Date() },
    });
  }
}
