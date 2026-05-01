import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio.service';

@Injectable()
export class DeleteFileUseCase {
  constructor(private readonly minioService: MinioService) {}

  async execute(bucketName: string, fileName: string): Promise<void> {
    await this.minioService.deleteFile(bucketName, fileName);
  }
}
