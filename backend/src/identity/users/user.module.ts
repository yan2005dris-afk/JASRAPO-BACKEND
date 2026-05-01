import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case';
import { AssignPermissionToUserUseCase } from './use-cases/assign-permission-to-user.use-case';
import { RevokePermissionFromUserUseCase } from './use-cases/revoke-permission-from-user.use-case';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    AssignRoleToUserUseCase,
    AssignPermissionToUserUseCase,
    RevokePermissionFromUserUseCase,
  ],
  exports: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    AssignRoleToUserUseCase,
    AssignPermissionToUserUseCase,
    RevokePermissionFromUserUseCase,
  ],
})
export class UserModule {}
