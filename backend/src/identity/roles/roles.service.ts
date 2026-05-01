import { Injectable } from '@nestjs/common';
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
    return this.prisma.roles.findMany();
  }

  findOne(id: number) {
    return this.prisma.roles.findUnique({ where: { rolesId: id } });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: { rolesId: id },
      data: updateRoleDto,
    });
  }

  async getRolePermissions(rolesId: number) {
    return this.getRolePermissionsUseCase.execute(rolesId);
  }

  async assignPermission(rolesId: number, permissionsId: number) {
    return this.assignPermissionUseCase.execute(rolesId, permissionsId);
  }

  async removePermission(rolesId: number, permissionsId: number) {
    return this.removePermissionUseCase.execute(rolesId, permissionsId);
  }
}
