import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rolesId: number, permissionsId: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt) throw new NotFoundException('Rol no encontrado o eliminado');

    const permission = await this.prisma.permissions.findUnique({ where: { permissionsId } });
    if (!permission || permission.deletedAt) throw new NotFoundException('Permiso no encontrado o eliminado');

    const existing = await this.prisma.rolPermissions.findFirst({
      where: { rolesId, permissionsId },
    });

    if (existing) {
      if (existing.deletedAt) {
        return this.prisma.rolPermissions.update({
          where: { rolPermissionsId: existing.rolPermissionsId },
          data: { deletedAt: null },
        });
      }
      throw new ConflictException('El rol ya tiene ese permiso asignado');
    }

    return this.prisma.rolPermissions.create({ data: { rolesId, permissionsId } });
  }
}
