import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number, rolesId: number) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    if (user.rolesId === rolesId)
      throw new ConflictException('El usuario ya tiene ese rol activo');

    return this.prisma.users.update({
      where: { usersId },
      data: { rolesId },
    });
  }
}
