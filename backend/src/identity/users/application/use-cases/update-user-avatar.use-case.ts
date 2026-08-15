import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserAvatar } from '../../domain/types/user.types';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  uploadAvatar,
  rollbackAvatarUpload,
  deleteOldAvatar,
} from '../avatar-upload.helper';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

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
      throw new EntityNotFoundException('Usuario', usuarioId);
    }

    let newAvatarKey: string | undefined;
    const oldAvatar = user.avatar as { key?: string } | null;
    const oldAvatarKey = oldAvatar?.key;

    try {
      newAvatarKey = await uploadAvatar(file, this.storageService);

      await this.userRepository.update(usuarioId, {
        avatar: { key: newAvatarKey },
      });

      await deleteOldAvatar(oldAvatarKey, newAvatarKey, this.storageService);

      const updatedUser = await this.userRepository.findById(usuarioId);
      return updatedUser?.avatar as UserAvatar;
    } catch (error) {
      if (newAvatarKey) {
        await rollbackAvatarUpload(newAvatarKey, this.storageService);
      }
      throw error;
    }
  }
}
