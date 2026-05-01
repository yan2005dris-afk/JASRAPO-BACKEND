import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ListFilesUseCase } from './list-files.use-case';
import { MinioService } from '../minio.service';

describe('ListFilesUseCase', () => {
  let useCase: ListFilesUseCase;
  let minioService: jest.Mocked<MinioService>;

  beforeEach(async () => {
    const mockMinioService = {
      listFiles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListFilesUseCase,
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    useCase = module.get<ListFilesUseCase>(ListFilesUseCase);
    minioService = module.get(MinioService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list files from bucket', async () => {
    const bucket = 'documents';
    const expectedFiles = ['file1.pdf', 'file2.pdf', 'folder/file3.pdf'];

    minioService.listFiles.mockResolvedValue(expectedFiles);

    const result = await useCase.execute(bucket);

    expect(result).toEqual(expectedFiles);
    expect(minioService.listFiles).toHaveBeenCalledWith(bucket, undefined);
  });

  it('should list files with prefix', async () => {
    const bucket = 'documents';
    const prefix = 'folder/';
    const expectedFiles = ['folder/file1.pdf', 'folder/file2.pdf'];

    minioService.listFiles.mockResolvedValue(expectedFiles);

    const result = await useCase.execute(bucket, prefix);

    expect(result).toEqual(expectedFiles);
    expect(minioService.listFiles).toHaveBeenCalledWith(bucket, prefix);
  });

  it('should return empty array when no files', async () => {
    minioService.listFiles.mockResolvedValue([]);

    const result = await useCase.execute('empty-bucket');

    expect(result).toEqual([]);
  });
});
