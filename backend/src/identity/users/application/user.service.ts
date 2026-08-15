import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { UserRepository } from '../domain/repositories/user.repository';
import { RoleRepository } from '../../roles/domain/repositories/role.repository';
import { UserEntity } from '../domain/entities/user.entity';
import {
  UserAvatar,
  EffectivePermissionsResponse,
} from '../domain/types/user.types';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async user(criteria: {
    usuarioId?: number;
    email?: string;
  }): Promise<UserEntity | null> {
    const user = criteria.usuarioId
      ? await this.userRepository.findById(criteria.usuarioId)
      : criteria.email
        ? await this.userRepository.findByEmail(criteria.email)
        : null;

    if (!user || user.deletedAt) return null;

    const [directPermissionRows, rolePermissionRows] = await Promise.all([
      this.userRepository.findDirectPermissions(user.usuarioId),
      user.rol && !user.rol.deletedAt
        ? this.userRepository.findRolePermissions(user.rol.rolId)
        : Promise.resolve([]),
    ]);

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
      permisosDirectos: directPermissionRows.map((a) => ({
        usuarioPermisoId: a.usuarioPermisoId,
        permisoId: a.permisoId,
        recurso: a.permiso.recurso,
        accion: a.permiso.accion,
        permitido: a.permitido,
      })),
      permisosRol: rolePermissionRows.map((rp) => ({
        recurso: rp.permiso.recurso,
        accion: rp.permiso.accion,
      })),
    } as any;
  }

  async findMe(usersId: number): Promise<UserEntity> {
    const user = await this.userRepository.findById(usersId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const fullName = [user.nombres, user.apellidos].filter(Boolean).join(' ');

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombre: fullName || null,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
    } as any;
  }

  async createUser(
    dto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    let avatarKey: string | undefined;

    if (file) {
      avatarKey = await this.uploadAndProcessAvatar(file);
      dto.avatar = { key: avatarKey };
    }

    try {
      return await this.createUserUseCase.execute(dto);
    } catch (error) {
      if (avatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, avatarKey)
          .catch(() => {});
      }
      throw error;
    }
  }

  async users(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserEntity>> {
    return this.userRepository.findManyActive(paginationDto);
  }

  async updateUser(
    usuarioId: number,
    updateData: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity | null> {
    const existingUser = await this.userRepository.findById(usuarioId);
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (existingUser.deletedAt) {
      throw new BadRequestException(
        'No se puede modificar un usuario eliminado',
      );
    }

    // Validar campos que no pueden estar vacíos
    if (updateData.nombres !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.nombres, 'nombres');
    }
    if (updateData.apellidos !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.apellidos, 'apellidos');
    }
    if (updateData.email !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.email, 'email');
    }
    if (updateData.telefono !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.telefono, 'telefono');
      updateData.telefono = PhoneUtil.validateAndClean(
        updateData.telefono,
        'telefono',
      );
    }

    // Validar rolId si se proporciona
    if (updateData.rolId !== undefined && updateData.rolId !== null) {
      const role = await this.roleRepository.findUnique(updateData.rolId);
      if (!role || role.deletedAt) {
        throw new NotFoundException('Rol no encontrado o eliminado');
      }
    }

    let newAvatarKey: string | undefined;
    let oldAvatarKey: string | undefined;

    if (file) {
      try {
        const oldAvatar = existingUser.avatar as { key?: string } | null;
        oldAvatarKey = oldAvatar?.key;
        newAvatarKey = await this.uploadAndProcessAvatar(file);
      } catch (error) {
        throw error;
      }
    }

    try {
      const result = await this.userRepository.executeTransaction(async (tx) => {
        if (updateData.directPermissions !== undefined) {
          await this.updateUserPermissionsUseCase.execute(
            usuarioId,
            updateData.directPermissions,
            tx,
          );
        }

        const updatePayload: Record<string, any> = {};
        if (updateData.email !== undefined) updatePayload.email = updateData.email;
        if (updateData.nombres !== undefined) updatePayload.nombres = updateData.nombres;
        if (updateData.apellidos !== undefined) updatePayload.apellidos = updateData.apellidos;
        if (updateData.telefono !== undefined) updatePayload.telefono = updateData.telefono;
        if (updateData.rolId !== undefined) updatePayload.rolId = updateData.rolId;
        if (newAvatarKey) updatePayload.avatar = { key: newAvatarKey };

        if (Object.keys(updatePayload).length > 0) {
          return this.userRepository.update(usuarioId, updatePayload, tx);
        }

        return existingUser;
      });

      if (newAvatarKey && oldAvatarKey && oldAvatarKey !== newAvatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, oldAvatarKey)
          .catch(() => {});
      }

      return this.user({ usuarioId: result.usuarioId });
    } catch (error) {
      if (newAvatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, newAvatarKey)
          .catch(() => {});
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }

      throw error;
    }
  }

  async updateAvatar(
    usuarioId: number,
    file: Express.Multer.File,
  ): Promise<UserAvatar> {
    const user = await this.userRepository.findById(usuarioId);
    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let newAvatarKey: string | undefined;
    const oldAvatar = user.avatar as { key?: string } | null;
    const oldAvatarKey = oldAvatar?.key;

    try {
      newAvatarKey = await this.uploadAndProcessAvatar(file);

      await this.userRepository.update(usuarioId, {
        avatar: { key: newAvatarKey },
      });

      if (oldAvatarKey && oldAvatarKey !== newAvatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, oldAvatarKey)
          .catch(() => {});
      }

      const updatedUser = await this.userRepository.findById(usuarioId);
      return updatedUser?.avatar as UserAvatar;
    } catch (error) {
      if (newAvatarKey) {
        this.storageService
          .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, newAvatarKey)
          .catch(() => {});
      }
      throw error;
    }
  }

  async softDeleteUser(usuarioId: number) {
    return this.userRepository.update(usuarioId, { deletedAt: new Date() });
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

  private async uploadAndProcessAvatar(
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const processedBuffer = await ImageProcessorUtil.processProfilePicture(
        file.buffer,
      );

      const avatarKey = `avatars/${randomUUID()}.webp`;

      await this.storageService.upload(
        SRI_STORAGE_TYPES.PROFILE_PHOTOS,
        avatarKey,
        processedBuffer,
        { contentType: 'image/webp' },
      );

      return avatarKey;
    } catch (error) {
      throw error;
    }
  }
}
