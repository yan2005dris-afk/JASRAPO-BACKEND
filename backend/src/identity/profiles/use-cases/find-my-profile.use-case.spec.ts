import { Test, TestingModule } from '@nestjs/testing';
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
            profiles: {
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
    const profile = { id: 1, usersId: userId };
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute(userId);

    expect(prisma.profiles.findUnique).toHaveBeenCalledWith({ where: { usersId: userId } });
    expect(result).toEqual(profile);
  });

  it('should create and return profile if it does not exist', async () => {
    const userId = 1;
    const profile = { id: 1, usersId: userId };
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.profiles.create as jest.Mock).mockResolvedValue(profile);

    const result = await useCase.execute(userId);

    expect(prisma.profiles.findUnique).toHaveBeenCalled();
    expect(prisma.profiles.create).toHaveBeenCalledWith({ data: { usersId: userId } });
    expect(result).toEqual(profile);
  });
});
