import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';

@Injectable()
export class SelectExistingAvatarUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async execute(usersId: number, key: string) {
    if (!key) {
      throw new BadRequestException('Debe indicar el key del archivo');
    }

    const exists = await this.minioService.fileExists('avatars', key);
    if (!exists) {
      throw new NotFoundException('Imagen no encontrada en el almacenamiento.');
    }

    const meta = await this.minioService.getFileMetadata('avatars', key);
    const avatarMeta = {
      uuid: key.split('.')[0],
      key,
      originalName: key,
      mimeType: meta?.contentType || 'image/png',
      size: meta?.size || 0,
      bucket: 'avatars',
      uploadedAt: meta?.lastModified?.toISOString() || new Date().toISOString(),
    };

    const profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!profile) {
      await this.prisma.profiles.create({
        data: { usersId, avatar: avatarMeta },
      });
    } else {
      await this.prisma.profiles.update({
        where: { usersId },
        data: { avatar: avatarMeta },
      });
    }

    return { message: 'Avatar vinculado exitosamente', avatar: avatarMeta };
  }
}
