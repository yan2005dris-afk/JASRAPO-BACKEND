import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateProfileUseCase } from './update-profile.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
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
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should update existing profile', async () => {
    const userId = 1;
    const dto = { firstName: 'Jane' };
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      usersId: userId,
    });
    (prisma.profiles.update as jest.Mock).mockResolvedValue({ id: 1, ...dto });

    const result = await useCase.execute(userId, dto as any);

    expect(prisma.profiles.update).toHaveBeenCalledWith({
      where: { usersId: userId },
      data: expect.objectContaining(dto),
    });
    expect(result.firstName).toBe('Jane');
  });

  it('should create profile if it does not exist during update', async () => {
    const userId = 1;
    const dto = { firstName: 'Jane' };
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.profiles.create as jest.Mock).mockResolvedValue({ id: 1, ...dto });

    await useCase.execute(userId, dto as any);

    expect(prisma.profiles.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ usersId: userId, firstName: 'Jane' }),
    });
  });
});
