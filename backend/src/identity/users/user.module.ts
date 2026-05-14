import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { GetUserDirectPermissionsUseCase } from './use-cases/get-user-direct-permissions.use-case';
import { GetUserRolePermissionsUseCase } from './use-cases/get-user-role-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [forwardRef(() => StorageModule)],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    GetUserDirectPermissionsUseCase,
    GetUserRolePermissionsUseCase,
    UpdateUserPermissionsUseCase,
  ],
  exports: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    GetUserDirectPermissionsUseCase,
    GetUserRolePermissionsUseCase,
    UpdateUserPermissionsUseCase,
  ],
})
export class UserModule {}
