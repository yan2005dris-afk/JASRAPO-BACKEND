import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class AssignPermissionToUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number, permissionsId: number, allow = true) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const permission = await this.prisma.permissions.findUnique({
      where: { permissionsId },
    });
    if (!permission || permission.deletedAt)
      throw new NotFoundException('Permiso no encontrado o eliminado');

    const existing = await this.prisma.userPermissions.findFirst({
      where: { usersId, permissionsId, deletedAt: null },
    });

    if (existing) {
      return this.prisma.userPermissions.update({
        where: { idUserPermissions: existing.idUserPermissions },
        data: { allow },
      });
    }

    return this.prisma.userPermissions.create({
      data: { usersId, permissionsId, allow },
    });
  }
}
