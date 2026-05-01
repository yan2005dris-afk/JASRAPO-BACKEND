import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SetRoleChildrenDto } from '../dto/set-role-children.dto';

@Injectable()
export class SetRoleChildrenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rolesId: number, dto: SetRoleChildrenDto) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    const normalizedChildRoleIds = Array.from(
      new Set(
        dto.childRoleIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0 && id !== rolesId),
      ),
    );

    if (normalizedChildRoleIds.length > 0) {
      await this.assertChildRolesExist(normalizedChildRoleIds);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rolesHeredados.updateMany({
        where: {
          parentRoleId: rolesId,
          deletedAt: null,
          childRoleId: { notIn: normalizedChildRoleIds },
        },
        data: { deletedAt: new Date() },
      });

      for (const childRoleId of normalizedChildRoleIds) {
        const existing = await tx.rolesHeredados.findFirst({
          where: { parentRoleId: rolesId, childRoleId },
          select: { roleHierarchyId: true, deletedAt: true },
        });

        if (!existing) {
          await tx.rolesHeredados.create({
            data: { parentRoleId: rolesId, childRoleId },
          });
          continue;
        }

        if (existing.deletedAt) {
          await tx.rolesHeredados.update({
            where: { roleHierarchyId: existing.roleHierarchyId },
            data: { deletedAt: null },
          });
        }
      }

      return tx.rolesHeredados.findMany({
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
    });
  }

  private async assertChildRolesExist(childRoleIds: number[]) {
    const validRoles = await this.prisma.roles.findMany({
      where: { rolesId: { in: childRoleIds }, deletedAt: null },
      select: { rolesId: true },
    });
    const validRoleIds = new Set(validRoles.map((role) => role.rolesId));
    const missing = childRoleIds.filter((id) => !validRoleIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `No se encontraron roles hijos válidos: ${missing.join(', ')}`,
      );
    }
  }
}
