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

  async execute(usuarioId: number, key: string) {
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

    const profile = await this.prisma.perfiles.findUnique({
      where: { usuarioId },
    });

    if (!profile) {
      await this.prisma.perfiles.create({
        data: { usuarioId, avatar: avatarMeta },
      });
    } else {
      await this.prisma.perfiles.update({
        where: { usuarioId },
        data: { avatar: avatarMeta },
      });
    }

    return { message: 'Avatar vinculado exitosamente', avatar: avatarMeta };
  }
}
