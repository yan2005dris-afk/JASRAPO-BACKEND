import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioService } from '../minio.service';

@Injectable()
export class UploadFileUseCase {
  constructor(private readonly minioService: MinioService) {}

  async execute(
    bucketName: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<string> {
    if (!bucketName || !fileName || !buffer) {
      throw new BadRequestException(
        'Datos de archivo incompletos para la subida',
      );
    }
    return this.minioService.uploadFile(bucketName, fileName, buffer);
  }
}
