import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio.service';

@Injectable()
export class GetFileUrlUseCase {
  constructor(private readonly minioService: MinioService) {}

  async execute(bucketName: string, fileName: string): Promise<string> {
    return this.minioService.getPresignedUrl(bucketName, fileName);
  }
}
