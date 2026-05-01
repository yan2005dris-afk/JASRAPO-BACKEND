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

    const directRoleIds =
      user.role && !user.role.deletedAt ? [user.role.rolesId] : [];
    const allRoleIds = await this.resolveRoleHierarchy(directRoleIds);

    const rolePermissionAssignments =
      allRoleIds.length === 0
        ? []
        : await this.prisma.rolPermissions.findMany({
            where: {
              deletedAt: null,
              rolesId: { in: allRoleIds },
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

  private async resolveRoleHierarchy(
    initialRoleIds: number[],
  ): Promise<number[]> {
    if (initialRoleIds.length === 0) return [];
    const edges = await this.prisma.rolesHeredados.findMany({
      where: {
        deletedAt: null,
        parentRole: { deletedAt: null },
        childRole: { deletedAt: null },
      },
      select: { parentRoleId: true, childRoleId: true },
    });

    const childrenByParent = new Map<number, number[]>();
    for (const edge of edges) {
      const current = childrenByParent.get(edge.parentRoleId) ?? [];
      current.push(edge.childRoleId);
      childrenByParent.set(edge.parentRoleId, current);
    }

    const visited = new Set<number>();
    const stack = [...initialRoleIds];
    while (stack.length > 0) {
      const roleId = stack.pop()!;
      if (visited.has(roleId)) continue;
      visited.add(roleId);
      const children = childrenByParent.get(roleId) ?? [];
      for (const childId of children) {
        if (!visited.has(childId)) stack.push(childId);
      }
    }
    return Array.from(visited);
  }
}
