import { Test, TestingModule } from '@nestjs/testing';
import { ListAvailableAvatarsUseCase } from './list-available-avatars.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MinioService } from '../../../infrastructure/storage/minio.service';

describe('ListAvailableAvatarsUseCase', () => {
  let useCase: ListAvailableAvatarsUseCase;
  let prisma: PrismaService;
  let minio: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAvailableAvatarsUseCase,
        {
          provide: PrismaService,
          useValue: {
            profiles: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: MinioService,
          useValue: {
            listFiles: jest.fn(),
            getPresignedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListAvailableAvatarsUseCase>(ListAvailableAvatarsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    minio = module.get<MinioService>(MinioService);
  });

  it('should list available avatars', async () => {
    const userId = 1;
    (minio.listFiles as jest.Mock).mockResolvedValue(['avatar_profile_1_abc.png']);
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ id: 1, avatar: { key: 'current.png' } });
    (minio.getPresignedUrl as jest.Mock).mockResolvedValue('http://url');

    const result = await useCase.execute(userId);

    expect(result.avatars).toHaveLength(2); // one from listFiles, one from current profile
    expect(result.avatars[0]).toHaveProperty('key');
    expect(result.avatars[0]).toHaveProperty('url');
  });
});
