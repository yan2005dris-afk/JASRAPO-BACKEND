import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetRolePermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rolesId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const assignments = await this.prisma.rolPermissions.findMany({
      where: {
        rolesId: rolesId,
        deletedAt: null,
        permissions: { deletedAt: null },
      },
      orderBy: [
        { permissions: { resource: 'asc' } },
        { permissions: { action: 'asc' } },
      ],
      include: {
        permissions: {
          select: { permissionsId: true, resource: true, action: true },
        },
      },
    });

    return assignments.map((assignment) => ({
      rolPermissionsId: assignment.rolPermissionsId,
      permissionsId: assignment.permissionsId,
      resource: assignment.permissions.resource,
      action: assignment.permissions.action,
    }));
  }
}
