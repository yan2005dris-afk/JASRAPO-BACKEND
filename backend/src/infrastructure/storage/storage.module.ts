import { Module, forwardRef } from '@nestjs/common';
import { MinioService } from './minio.service';
import { FilesController } from './files.controller';
import { AuthModule } from 'src/identity/auth/auth.module';
import { UploadFileUseCase } from './use-cases/upload-file.use-case';
import { GetFileUrlUseCase } from './use-cases/get-file-url.use-case';
import { ListFilesUseCase } from './use-cases/list-files.use-case';
import { DeleteFileUseCase } from './use-cases/delete-file.use-case';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [FilesController],
  providers: [
    MinioService,
    UploadFileUseCase,
    GetFileUrlUseCase,
    ListFilesUseCase,
    DeleteFileUseCase,
  ],
  exports: [
    MinioService,
    UploadFileUseCase,
    GetFileUrlUseCase,
    ListFilesUseCase,
    DeleteFileUseCase,
  ],
})
export class StorageModule {}
