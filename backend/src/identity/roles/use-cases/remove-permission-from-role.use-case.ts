import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemovePermissionFromRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rolesId: number, permissionsId: number) {
    const assignment = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (!assignment) {
      throw new NotFoundException('Permiso no asignado a este rol');
    }

    return this.prisma.rolPermissions.update({
      where: { rolPermissionsId: assignment.rolPermissionsId },
      data: { deletedAt: new Date() },
      select: { permissionsId: true },
    });
  }
}
