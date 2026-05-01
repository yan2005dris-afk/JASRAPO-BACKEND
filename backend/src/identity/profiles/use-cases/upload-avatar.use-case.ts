import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async execute(usersId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    let profile = await this.prisma.profiles.findUnique({
      where: { usersId },
    });

    if (!profile) {
      profile = await this.prisma.profiles.create({
        data: { usersId },
      });
    }

    const uuid = randomUUID();
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${uuid}.${fileExtension}`;
    const bucketName = 'avatars';

    await this.minioService.uploadFile(bucketName, fileName, file.buffer);

    const avatarMeta = {
      uuid,
      key: fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      bucket: bucketName,
      uploadedAt: new Date().toISOString(),
    };

    await this.prisma.profiles.update({
      where: { usersId },
      data: { avatar: avatarMeta },
    });

    return {
      message: 'Foto de perfil actualizada exitosamente',
      avatar: avatarMeta,
    };
  }
}
