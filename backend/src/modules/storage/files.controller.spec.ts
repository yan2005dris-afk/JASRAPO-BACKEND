import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { MinioService } from './minio.service';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            getPresignedUrl: jest.fn(),
            listFiles: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
