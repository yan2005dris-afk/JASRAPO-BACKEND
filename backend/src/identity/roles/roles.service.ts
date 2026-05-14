import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { GetRolePermissionsUseCase } from './use-cases/get-role-permissions.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private readonly assignPermissionUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionUseCase: RemovePermissionFromRoleUseCase,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  findAll() {
    return this.prisma.roles.findMany({
      where: { deletedAt: null },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.roles.findUnique({ where: { rolId: id } });
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado');
    return role;
  }
  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: { rolId: id },
      data: { nombre: updateRoleDto.nombre },
    });
  }

  async getRolePermissions(rolId: number) {
    return this.getRolePermissionsUseCase.execute(rolId);
  }

  async assignPermission(rolId: number, permisoId: number) {
    return this.assignPermissionUseCase.execute(rolId, permisoId);
  }

  async removePermission(rolId: number, permisoId: number) {
    return this.removePermissionUseCase.execute(rolId, permisoId);
  }
}
