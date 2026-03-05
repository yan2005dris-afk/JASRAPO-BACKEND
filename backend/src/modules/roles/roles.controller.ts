import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RequiredPermission('roles', 'create')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @RequiredPermission('roles', 'read')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @RequiredPermission('roles', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @RequiredPermission('roles', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @RequiredPermission('roles', 'read')
  @Get(':id/permissions')
  getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(+id);
  }

  @RequiredPermission('roles', 'update')
  @Post(':id/permissions')
  assignPermission(
    @Param('id') id: string,
    @Body() assignRolePermissionDto: AssignRolePermissionDto,
  ) {
    return this.rolesService.assignPermission(
      +id,
      assignRolePermissionDto.permissionsId,
    );
  }

  @RequiredPermission('roles', 'delete')
  @Patch(':id/permissions/:permissionId')
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removePermission(+id, +permissionId);
  }
}
