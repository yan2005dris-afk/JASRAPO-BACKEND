import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { UploadFileUseCase } from './use-cases/upload-file.use-case';
import { GetFileUrlUseCase } from './use-cases/get-file-url.use-case';
import { ListFilesUseCase } from './use-cases/list-files.use-case';
import { DeleteFileUseCase } from './use-cases/delete-file.use-case';

describe('FilesController', () => {
  let controller: FilesController;

  const mockUploadFileUseCase = { execute: jest.fn() };
  const mockGetFileUrlUseCase = { execute: jest.fn() };
  const mockListFilesUseCase = { execute: jest.fn() };
  const mockDeleteFileUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: UploadFileUseCase, useValue: mockUploadFileUseCase },
        { provide: GetFileUrlUseCase, useValue: mockGetFileUrlUseCase },
        { provide: ListFilesUseCase, useValue: mockListFilesUseCase },
        { provide: DeleteFileUseCase, useValue: mockDeleteFileUseCase },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
