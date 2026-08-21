import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interfaces/http/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserDetailUseCase } from './application/use-cases/get-user-detail.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { GetActiveUsersUseCase } from './application/use-cases/get-active-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UpdateUserAvatarUseCase } from './application/use-cases/update-user-avatar.use-case';
import { SoftDeleteUserUseCase } from './application/use-cases/soft-delete-user.use-case';
import { GetEffectivePermissionsUseCase } from './application/use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './application/use-cases/update-user-permissions.use-case';
import { ResendInvitationUseCase } from './application/use-cases/resend-invitation.use-case';
import { GetPendingInvitationsUseCase } from './application/use-cases/get-pending-invitations.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RolesModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    UserService,
    CreateUserUseCase,
    GetUserDetailUseCase,
    GetUserProfileUseCase,
    GetActiveUsersUseCase,
    UpdateUserUseCase,
    UpdateUserAvatarUseCase,
    SoftDeleteUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
    ResendInvitationUseCase,
    GetPendingInvitationsUseCase,
    UserMapper,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    UserService,
    CreateUserUseCase,
    GetUserDetailUseCase,
    GetUserProfileUseCase,
    GetActiveUsersUseCase,
    UpdateUserUseCase,
    UpdateUserAvatarUseCase,
    SoftDeleteUserUseCase,
    GetEffectivePermissionsUseCase,
    UpdateUserPermissionsUseCase,
    UserRepository,
    UserMapper,
  ],
})
export class UserModule {}
