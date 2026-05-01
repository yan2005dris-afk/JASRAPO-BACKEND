import { Test, TestingModule } from '@nestjs/testing';
import { GetFileUrlUseCase } from './get-file-url.use-case';
import { MinioService } from '../minio.service';

describe('GetFileUrlUseCase', () => {
  let useCase: GetFileUrlUseCase;
  let minioService: jest.Mocked<MinioService>;

  beforeEach(async () => {
    const mockMinioService = {
      getPresignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFileUrlUseCase,
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    useCase = module.get<GetFileUrlUseCase>(GetFileUrlUseCase);
    minioService = module.get(MinioService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return presigned URL', async () => {
    const bucket = 'documents';
    const fileName = 'test.pdf';
    const expectedUrl = 'http://minio:9000/documents/test.pdf?signature=xyz';

    minioService.getPresignedUrl.mockResolvedValue(expectedUrl);

    const result = await useCase.execute(bucket, fileName);

    expect(result).toBe(expectedUrl);
    expect(minioService.getPresignedUrl).toHaveBeenCalledWith(bucket, fileName);
  });
});