import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SelectExistingAvatarUseCase } from './select-existing-avatar.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SelectExistingAvatarUseCase', () => {
  let useCase: SelectExistingAvatarUseCase;
  let prisma: PrismaService;
  let minio: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectExistingAvatarUseCase,
        {
          provide: PrismaService,
          useValue: {
            profiles: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: MinioService,
          useValue: {
            fileExists: jest.fn(),
            getFileMetadata: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<SelectExistingAvatarUseCase>(
      SelectExistingAvatarUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
    minio = module.get<MinioService>(MinioService);
  });

  it('should select an existing avatar', async () => {
    const userId = 1;
    const key = 'existing.png';
    (minio.fileExists as jest.Mock).mockResolvedValue(true);
    (minio.getFileMetadata as jest.Mock).mockResolvedValue({
      contentType: 'image/png',
      size: 100,
    });
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      usersId: userId,
    });

    const result = await useCase.execute(userId, key);

    expect(prisma.profiles.update).toHaveBeenCalled();
    expect(result.message).toBe('Avatar vinculado exitosamente');
  });

  it('should throw NotFoundException if file does not exist in Minio', async () => {
    (minio.fileExists as jest.Mock).mockResolvedValue(false);
    await expect(useCase.execute(1, 'non-existent.png')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if key is not provided', async () => {
    await expect(useCase.execute(1, '')).rejects.toThrow(BadRequestException);
  });
});
