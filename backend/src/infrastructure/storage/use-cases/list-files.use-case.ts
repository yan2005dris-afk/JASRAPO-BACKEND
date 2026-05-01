import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio.service';

@Injectable()
export class ListFilesUseCase {
  constructor(private readonly minioService: MinioService) {}

  async execute(bucketName: string, prefix?: string): Promise<string[]> {
    return this.minioService.listFiles(bucketName, prefix);
  }
}
