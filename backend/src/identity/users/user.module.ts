import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
  ],
  exports: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
  ],
})
export class UserModule {}
