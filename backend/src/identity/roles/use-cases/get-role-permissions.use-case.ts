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

    const allRoleIds = await this.resolveRoleHierarchy([rolesId]);

    const assignments = await this.prisma.rolPermissions.findMany({
      where: {
        rolesId: { in: allRoleIds },
        deletedAt: null,
        permissions: { deletedAt: null },
      },
      orderBy: [{ permissions: { resource: 'asc' } }, { permissions: { action: 'asc' } }],
      include: {
        permissions: { select: { permissionsId: true, resource: true, action: true } },
      },
    });

    const seen = new Set<number>();
    return assignments
      .filter((a) => {
        if (seen.has(a.permissionsId)) return false;
        seen.add(a.permissionsId);
        return true;
      })
      .map((assignment) => ({
        rolPermissionsId: assignment.rolPermissionsId,
        permissionsId: assignment.permissionsId,
        resource: assignment.permissions.resource,
        action: assignment.permissions.action,
      }));
  }

  private async resolveRoleHierarchy(initialRoleIds: number[]): Promise<number[]> {
    if (initialRoleIds.length === 0) return [];
    const edges = await this.prisma.rolesHeredados.findMany({
      where: { deletedAt: null, parentRole: { deletedAt: null }, childRole: { deletedAt: null } },
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
