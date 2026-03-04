import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.roles.create({
        data: createRoleDto,
      });
    } catch (error: unknown) {
      if (this.isRolesIdUniqueConstraintError(error)) {
        await this.syncRolesIdSequence();
        return this.prisma.roles.create({
          data: createRoleDto,
        });
      }

      throw error;
    }
  }

  private isRolesIdUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const maybeError = error as {
      code?: unknown;
      meta?: {
        target?: unknown;
        driverAdapterError?: {
          cause?: {
            constraint?: {
              fields?: unknown;
            };
          };
        };
      };
    };

    if (maybeError.code !== 'P2002') {
      return false;
    }

    const target = maybeError.meta?.target;
    if (Array.isArray(target) && target.some((field) => field === 'roles_id')) {
      return true;
    }

    const driverFields =
      maybeError.meta?.driverAdapterError?.cause?.constraint?.fields;
    if (
      Array.isArray(driverFields) &&
      driverFields.some((field) => field === 'roles_id')
    ) {
      return true;
    }

    return false;
  }

  private async syncRolesIdSequence(): Promise<void> {
    const sequenceResult = await this.prisma.$queryRaw<
      { seq: string | null }[]
    >`
      SELECT pg_get_serial_sequence('roles', 'roles_id') AS seq
    `;

    const sequenceName = sequenceResult[0]?.seq;
    if (!sequenceName) {
      return;
    }

    const escapedSequenceName = sequenceName.replace(/'/g, "''");

    await this.prisma.$executeRawUnsafe(`
      SELECT setval('${escapedSequenceName}', COALESCE((SELECT MAX(roles_id) FROM roles), 0) + 1, false)
    `);
  }

  findAll() {
    return this.prisma.roles.findMany();
  }

  findOne(id: number) {
    return this.prisma.roles.findUnique({
      where: {
        rolesId: id,
      },
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: {
        rolesId: id,
      },
      data: updateRoleDto,
    });
  }

  remove(id: number) {
    return this.prisma.roles.delete({
      where: {
        rolesId: id,
      },
    });
  }

  async getRolePermissions(rolesId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const assignments = await this.prisma.rolPermissions.findMany({
      where: {
        rolesId,
        permissions: {
          deletedAt: null,
        },
      },
      orderBy: [
        { permissions: { resource: 'asc' } },
        { permissions: { action: 'asc' } },
      ],
      include: {
        permissions: {
          select: {
            permissionsId: true,
            resource: true,
            action: true,
          },
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

  async assignPermission(rolesId: number, permissionsId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const permission = await this.prisma.permissions.findUnique({
      where: { permissionsId },
    });
    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permiso no encontrado o eliminado');
    }

    const existing = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (existing) {
      throw new ConflictException('El rol ya tiene ese permiso asignado');
    }

    return this.prisma.rolPermissions.create({
      data: {
        rolesId,
        permissionsId,
      },
    });
  }

  async removePermission(rolesId: number, permissionsId: number) {
    const assignment = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (!assignment) {
      throw new NotFoundException('Permiso no asignado a este rol');
    }

    return this.prisma.rolPermissions.delete({
      where: {
        rolPermissionsId: assignment.rolPermissionsId,
      },
    });
  }
}
