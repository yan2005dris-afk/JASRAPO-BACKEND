import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';
import { UserRepository } from '../domain/repositories/user.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserDetailUseCase } from './use-cases/get-user-detail.use-case';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { GetActiveUsersUseCase } from './use-cases/get-active-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { UpdateUserAvatarUseCase } from './use-cases/update-user-avatar.use-case';
import { SoftDeleteUserUseCase } from './use-cases/soft-delete-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { ResendInvitationUseCase } from './use-cases/resend-invitation.use-case';
import {
  GetPendingInvitationsUseCase,
  PendingInvitation,
} from './use-cases/get-pending-invitations.use-case';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import type {
  UserRow,
  UserDetailData,
  UserAvatar,
  EffectivePermissionsResponse,
} from '../domain/types/user.types';
import { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { InvitationService } from 'src/identity/auth/application/services/invitation.service';

@LogContext()
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserDetailUseCase: GetUserDetailUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getActiveUsersUseCase: GetActiveUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly resendInvitationUseCase: ResendInvitationUseCase,
    private readonly getPendingInvitationsUseCase: GetPendingInvitationsUseCase,
    private readonly logger: LoggerService,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService?: InvitationService,
  ) {}

  async user(criteria: {
    usuarioId?: number;
    email?: string;
  }): Promise<UserDetailData | null> {
    return this.getUserDetailUseCase.execute(criteria);
  }

  async findMe(usersId: number): Promise<UserRow> {
    return this.getUserProfileUseCase.execute(usersId);
  }

  async createUser(
    dto: CreateUserDto,
    file?: Express.Multer.File,
    adminUserId?: number,
  ): Promise<UserRow> {
    const user = await this.createUserUseCase.execute(dto, file);

    // Disparar creación de invitación después de crear el usuario
    if (user && this.invitationService) {
      try {
        // InvitationService carga el usuario de la BD, solo necesita ID
        const dbUser = await this.userRepository.findById(user.usuarioId);
        if (dbUser) {
          await this.invitationService.createAndSendInvitation(
            {
              usuarioId: dbUser.usuarioId,
              email: dbUser.email,
              nombres: dbUser.nombres,
              apellidos: dbUser.apellidos,
            } as any,
            adminUserId,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Error creando invitación para usuario ${user.usuarioId}: ${(error as Error).message}`,
        );
      }
    }

    return user;
  }

  async users(paginationDto: PaginationDto): Promise<PaginatedResult<UserRow>> {
    return this.getActiveUsersUseCase.execute(paginationDto);
  }

  async updateUser(
    usuarioId: number,
    updateData: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserDetailData | null> {
    return this.updateUserUseCase.execute(usuarioId, updateData, file);
  }

  async updateAvatar(
    usuarioId: number,
    file: Express.Multer.File,
  ): Promise<UserAvatar> {
    return this.updateUserAvatarUseCase.execute(usuarioId, file);
  }

  async softDeleteUser(usuarioId: number): Promise<UserRow> {
    return this.softDeleteUserUseCase.execute(usuarioId);
  }

  async getEffectivePermissions(
    usuarioId: number,
  ): Promise<EffectivePermissionsResponse> {
    const permissions =
      await this.getEffectivePermissionsUseCase.execute(usuarioId);
    return {
      usuarioId,
      permisos: permissions.map((p) => ({
        recurso: p.recurso,
        accion: p.accion,
      })),
    };
  }

  async resendInvitation(
    usuarioId: number,
    adminId: number,
  ): Promise<{ message: string; invitationId: number; expiresAt: Date }> {
    return this.resendInvitationUseCase.execute(usuarioId, adminId);
  }

  async getPendingInvitations(): Promise<PendingInvitation[]> {
    return this.getPendingInvitationsUseCase.execute();
  }
}
