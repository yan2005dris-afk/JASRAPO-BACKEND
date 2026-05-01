import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UploadFileUseCase } from './upload-file.use-case';
import { MinioService } from '../minio.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadFileUseCase', () => {
  let useCase: UploadFileUseCase;

  const mockMinioService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileUseCase,
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    useCase = module.get<UploadFileUseCase>(UploadFileUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should upload file successfully', async () => {
    const bucket = 'documents';
    const fileName = 'test.pdf';
    const buffer = Buffer.from('test content');
    const expectedPath = 'documents/test.pdf';

    mockMinioService.uploadFile.mockResolvedValue(expectedPath);

    const result = await useCase.execute(bucket, fileName, buffer);

    expect(result).toBe(expectedPath);
    expect(mockMinioService.uploadFile).toHaveBeenCalledWith(
      bucket,
      fileName,
      buffer,
    );
  });

  it('should throw BadRequestException when bucket is missing', async () => {
    await expect(
      useCase.execute('', 'test.pdf', Buffer.from('content')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when fileName is missing', async () => {
    await expect(
      useCase.execute('bucket', '', Buffer.from('content')),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when buffer is missing', async () => {
    await expect(
      useCase.execute('bucket', 'test.pdf', undefined as any),
    ).rejects.toThrow(BadRequestException);
  });
});
