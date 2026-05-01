import { Test, TestingModule } from '@nestjs/testing';
import { DeleteFileUseCase } from './delete-file.use-case';
import { MinioService } from '../minio.service';

describe('DeleteFileUseCase', () => {
  let useCase: DeleteFileUseCase;
  let minioService: jest.Mocked<MinioService>;

  beforeEach(async () => {
    const mockMinioService = {
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteFileUseCase,
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    useCase = module.get<DeleteFileUseCase>(DeleteFileUseCase);
    minioService = module.get(MinioService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete file successfully', async () => {
    const bucket = 'documents';
    const fileName = 'test.pdf';

    minioService.deleteFile.mockResolvedValue(undefined);

    await expect(useCase.execute(bucket, fileName)).resolves.toBeUndefined();
    expect(minioService.deleteFile).toHaveBeenCalledWith(bucket, fileName);
  });
});