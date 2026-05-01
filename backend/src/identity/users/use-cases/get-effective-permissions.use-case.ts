import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetEffectivePermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      include: {
        role: { select: { rolesId: true, deletedAt: true } },
        userPermissions: {
          where: { deletedAt: null },
          include: { Permissions: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario eliminado o no encontrado');
    }

    const roleId = user.role && !user.role.deletedAt ? user.role.rolesId : null;

    const rolePermissionAssignments = !roleId
        ? []
        : await this.prisma.rolPermissions.findMany({
            where: {
              deletedAt: null,
              rolesId: roleId,
              permissions: { deletedAt: null },
            },
            include: {
              permissions: { select: { resource: true, action: true } },
            },
          });

    const effectivePermissionsMap = new Map<string, boolean>();

    rolePermissionAssignments.forEach((rp) => {
      effectivePermissionsMap.set(
        `${rp.permissions.resource}:${rp.permissions.action}`,
        true,
      );
    });

    user.userPermissions.forEach((up) => {
      if (up.Permissions && !up.Permissions.deletedAt) {
        const key = `${up.Permissions.resource}:${up.Permissions.action}`;
        if (up.allow) {
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
