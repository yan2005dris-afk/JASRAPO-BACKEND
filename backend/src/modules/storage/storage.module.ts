import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { FilesController } from './files.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FilesController],
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
