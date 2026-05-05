import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usuarioId: number, rolId: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
    });
    if (!usuario || usuario.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const rol = await this.prisma.roles.findUnique({ where: { rolId } });
    if (!rol || rol.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    if (usuario.rolId === rolId)
      throw new ConflictException('El usuario ya tiene ese rol activo');

    return this.prisma.usuarios.update({
      where: { usuarioId },
      data: { rolId },
    });
  }
}
