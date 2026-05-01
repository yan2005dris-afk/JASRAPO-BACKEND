import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetRoleChildrenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rolesId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    const links = await this.prisma.rolesHeredados.findMany({
      where: {
        parentRoleId: rolesId,
        deletedAt: null,
        childRole: { deletedAt: null },
      },
      select: {
        roleHierarchyId: true,
        childRoleId: true,
        childRole: { select: { name: true } },
      },
      orderBy: { childRoleId: 'asc' },
    });

    return links.map((link) => ({
      roleHierarchyId: link.roleHierarchyId,
      childRoleId: link.childRoleId,
      childRoleName: link.childRole.name,
    }));
  }
}
