import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './interfaces/http/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './application/use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './application/use-cases/update-user-permissions.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    UserService,
    CreateUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
    UserRepository,
  ],
})
export class UserModule {}
