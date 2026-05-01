import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileUseCase } from './create-profile.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('CreateProfileUseCase', () => {
  let useCase: CreateProfileUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProfileUseCase,
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

    useCase = module.get<CreateProfileUseCase>(CreateProfileUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a profile if it does not exist', async () => {
    const userId = 1;
    const dto = { firstName: 'John', lastName: 'Doe', phone: '123456' };
    
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.profiles.create as jest.Mock).mockResolvedValue({ id: 1, ...dto, usersId: userId });

    const result = await useCase.execute(userId, dto);

    expect(prisma.profiles.findUnique).toHaveBeenCalledWith({ where: { usersId: userId } });
    expect(prisma.profiles.create).toHaveBeenCalledWith({
      data: {
        usersId: userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });
    expect(result).toBeDefined();
    expect(result.usersId).toBe(userId);
  });

  it('should throw ConflictException if profile already exists', async () => {
    const userId = 1;
    const dto = { firstName: 'John', lastName: 'Doe' };
    
    (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ id: 1, usersId: userId });

    await expect(useCase.execute(userId, dto as any)).rejects.toThrow(ConflictException);
    expect(prisma.profiles.create).not.toHaveBeenCalled();
  });
});
