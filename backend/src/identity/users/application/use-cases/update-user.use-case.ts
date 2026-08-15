import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from 'src/generated/prisma/client';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../interfaces/dto/update-user.dto';
import { UpdateUserPermissionsUseCase } from './update-user-permissions.use-case';
import { GetUserDetailUseCase } from './get-user-detail.use-case';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
    private readonly getUserDetailUseCase: GetUserDetailUseCase,
    private readonly storageService: StorageService,
  ) {}

  async execute(
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

      return this.getUserDetailUseCase.execute({ usuarioId: result.usuarioId });
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

  private async uploadAndProcessAvatar(
    file: Express.Multer.File,
  ): Promise<string> {
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
  }
}
