import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { GetRolePermissionsUseCase } from './use-cases/get-role-permissions.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';
import { GetRoleChildrenUseCase } from './use-cases/get-role-children.use-case';
import { SetRoleChildrenUseCase } from './use-cases/set-role-children.use-case';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    CreateRoleUseCase,
    GetRolePermissionsUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    GetRoleChildrenUseCase,
    SetRoleChildrenUseCase,
  ],
  exports: [
    CreateRoleUseCase,
    GetRolePermissionsUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    GetRoleChildrenUseCase,
    SetRoleChildrenUseCase,
  ],
})
export class RolesModule {}
