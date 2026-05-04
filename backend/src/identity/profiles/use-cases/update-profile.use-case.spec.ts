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
            perfiles: {
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
    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue({
      perfilId: 1,
      usuarioId: userId,
    });
    (prisma.perfiles.update as jest.Mock).mockResolvedValue({
      perfilId: 1,
      nombres: dto.firstName,
    });

    const result = await useCase.execute(userId, dto as any);

    expect(prisma.perfiles.update).toHaveBeenCalledWith({
      where: { usuarioId: userId },
      data: expect.objectContaining({ nombres: dto.firstName }),
    });
    expect(result.nombres).toBe('Jane');
  });

  it('should create profile if it does not exist during update', async () => {
    const userId = 1;
    const dto = { nombres: 'Jane' };
    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.perfiles.create as jest.Mock).mockResolvedValue({
      perfilId: 1,
      nombres: 'Jane',
    });

    await useCase.execute(userId, { firstName: 'Jane' } as any);

    expect(prisma.perfiles.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ usuarioId: userId, nombres: 'Jane' }),
    });
  });
});
