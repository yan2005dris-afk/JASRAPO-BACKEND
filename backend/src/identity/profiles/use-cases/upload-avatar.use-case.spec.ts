import { Test, TestingModule } from '@nestjs/testing';
import { UploadAvatarUseCase } from './upload-avatar.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  let prisma: PrismaService;
  let minio: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAvatarUseCase,
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
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UploadAvatarUseCase>(UploadAvatarUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    minio = module.get<MinioService>(MinioService);
  });

  it('should upload avatar and update profile', async () => {
    const userId = 1;
    const file = {
      originalname: 'test.png',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
      size: 4,
    } as any;

    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ id: 1, usersId: userId });
    (minio.uploadFile as jest.Mock).mockResolvedValue(undefined);

    const result = await useCase.execute(userId, file);

    expect(minio.uploadFile).toHaveBeenCalled();
    expect(prisma.profiles.update).toHaveBeenCalled();
    expect(result.message).toBe('Foto de perfil actualizada exitosamente');
  });

  it('should throw BadRequestException if no file is provided', async () => {
    await expect(useCase.execute(1, null as any)).rejects.toThrow(BadRequestException);
  });
});
