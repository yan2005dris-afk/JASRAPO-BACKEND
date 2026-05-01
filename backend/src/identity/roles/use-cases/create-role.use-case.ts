import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createRoleDto: CreateRoleDto) {
    const { childRoleIds = [], ...roleData } = createRoleDto;
    const normalizedChildRoleIds = Array.from(
      new Set(
        childRoleIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    if (normalizedChildRoleIds.length > 0) {
      await this.assertChildRolesExist(normalizedChildRoleIds);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdRole = await tx.roles.create({ data: roleData });

        if (normalizedChildRoleIds.length > 0) {
          const safeChildIds = normalizedChildRoleIds.filter(
            (childRoleId) => childRoleId !== createdRole.rolesId,
          );

          if (safeChildIds.length > 0) {
            await tx.rolesHeredados.createMany({
              data: safeChildIds.map((childRoleId) => ({
                parentRoleId: createdRole.rolesId,
                childRoleId,
              })),
            });
          }
        }

        return createdRole;
      });
    } catch (error: any) {
      if (this.isRolesIdUniqueConstraintError(error)) {
        await this.syncRolesIdSequence();
        // Re-try after sync
        return this.prisma.$transaction(async (tx) => {
          const createdRole = await tx.roles.create({ data: roleData });
          if (normalizedChildRoleIds.length > 0) {
            const safeChildIds = normalizedChildRoleIds.filter(
              (childRoleId) => childRoleId !== createdRole.rolesId,
            );
            if (safeChildIds.length > 0) {
              await tx.rolesHeredados.createMany({
                data: safeChildIds.map((childRoleId) => ({
                  parentRoleId: createdRole.rolesId,
                  childRoleId,
                })),
              });
            }
          }
          return createdRole;
        });
      }
      throw error;
    }
  }

  private async assertChildRolesExist(childRoleIds: number[]) {
    const validRoles = await this.prisma.roles.findMany({
      where: { rolesId: { in: childRoleIds }, deletedAt: null },
      select: { rolesId: true },
    });
    const validRoleIds = new Set(validRoles.map((role) => role.rolesId));
    const missing = childRoleIds.filter((id) => !validRoleIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(`No se encontraron roles hijos válidos: ${missing.join(', ')}`);
    }
  }

  private isRolesIdUniqueConstraintError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;
    if (error.code !== 'P2002') return false;
    const target = error.meta?.target;
    if (Array.isArray(target) && target.some((field) => field === 'roles_id')) return true;
    const driverFields = error.meta?.driverAdapterError?.cause?.constraint?.fields;
    if (Array.isArray(driverFields) && driverFields.some((field) => field === 'roles_id')) return true;
    return false;
  }

  private async syncRolesIdSequence() {
    const sequenceResult = await this.prisma.$queryRaw<{ seq: string | null }[]>`SELECT pg_get_serial_sequence('roles', 'roles_id') AS seq`;
    const sequenceName = sequenceResult[0]?.seq;
    if (!sequenceName) return;
    const escapedSequenceName = sequenceName.replace(/'/g, "''");
    await this.prisma.$executeRawUnsafe(`SELECT setval('${escapedSequenceName}', COALESCE((SELECT MAX(roles_id) FROM roles), 0) + 1, false)`);
  }
}
