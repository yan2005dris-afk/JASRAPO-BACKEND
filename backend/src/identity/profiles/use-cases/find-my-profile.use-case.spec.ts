import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindMyProfileUseCase } from './find-my-profile.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindMyProfileUseCase', () => {
  let useCase: FindMyProfileUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindMyProfileUseCase,
        {
          provide: PrismaService,
          useValue: {
            perfiles: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<FindMyProfileUseCase>(FindMyProfileUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return existing profile', async () => {
    const userId = 1;
    const profile = { perfilId: 1, usuarioId: userId };
    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute(userId);

    expect(prisma.perfiles.findUnique).toHaveBeenCalledWith({
      where: { usuarioId: userId },
    });
    expect(result).toEqual(profile);
  });

  it('should create and return profile if it does not exist', async () => {
    const userId = 1;
    const profile = { perfilId: 1, usuarioId: userId };
    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.perfiles.create as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute(userId);

    expect(prisma.perfiles.findUnique).toHaveBeenCalled();
    expect(prisma.perfiles.create).toHaveBeenCalledWith({
      data: { usuarioId: userId },
    });
    expect(result).toEqual(profile);
  });
});
