import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';
import type { AvatarMeta } from '../types/profile-avatar.types';

@Injectable()
export class ListAvailableAvatarsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async execute(usersId: number) {
    const allFiles = await this.minioService.listFiles('avatars');
    const userFiles = allFiles.filter((f) =>
      f.startsWith(`avatar_profile_${usersId}_`),
    );

    const profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    const currentAvatarKey = this.getAvatarKey(profile?.avatar);
    if (currentAvatarKey && !userFiles.includes(currentAvatarKey)) {
      userFiles.push(currentAvatarKey);
    }

    const avatars = await Promise.all(
      userFiles.map(async (key) => {
        const url = await this.minioService.getPresignedUrl('avatars', key);
        return { key, url };
      }),
    );

    return { avatars };
  }

  private getAvatarKey(avatar: unknown): string | null {
    if (!avatar || typeof avatar !== 'object') return null;
    return (avatar as AvatarMeta).key || null;
  }
}
