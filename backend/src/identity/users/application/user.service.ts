import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserDetailUseCase } from './use-cases/get-user-detail.use-case';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { GetActiveUsersUseCase } from './use-cases/get-active-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { UpdateUserAvatarUseCase } from './use-cases/update-user-avatar.use-case';
import { SoftDeleteUserUseCase } from './use-cases/soft-delete-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { UserEntity } from '../domain/entities/user.entity';
import {
  UserAvatar,
  EffectivePermissionsResponse,
} from '../domain/types/user.types';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class UserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserDetailUseCase: GetUserDetailUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getActiveUsersUseCase: GetActiveUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly logger: LoggerService,
  ) {}

  async user(criteria: {
    usuarioId?: number;
    email?: string;
  }): Promise<UserEntity | null> {
    return this.getUserDetailUseCase.execute(criteria);
  }

  async findMe(usersId: number): Promise<UserEntity> {
    return this.getUserProfileUseCase.execute(usersId);
  }

  async createUser(
    dto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    return this.createUserUseCase.execute(dto, file);
  }

  async users(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserEntity>> {
    return this.getActiveUsersUseCase.execute(paginationDto);
  }

  async updateUser(
    usuarioId: number,
    updateData: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity | null> {
    return this.updateUserUseCase.execute(usuarioId, updateData, file);
  }

  async updateAvatar(
    usuarioId: number,
    file: Express.Multer.File,
  ): Promise<UserAvatar> {
    return this.updateUserAvatarUseCase.execute(usuarioId, file);
  }

  async softDeleteUser(usuarioId: number): Promise<UserEntity> {
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
}
