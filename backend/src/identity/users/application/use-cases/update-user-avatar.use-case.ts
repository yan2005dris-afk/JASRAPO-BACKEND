import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserAvatar } from '../../domain/types/user.types';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';

@Injectable()
export class UpdateUserAvatarUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
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
