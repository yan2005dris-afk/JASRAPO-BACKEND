import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
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
            perfiles: {
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

    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.perfiles.create as jest.Mock).mockResolvedValue({
      perfilId: 1,
      nombres: dto.firstName,
      apellidos: dto.lastName,
      telefono: dto.phone,
      usuarioId: userId,
    });

    const result = await useCase.execute(userId, dto);

    expect(prisma.perfiles.findUnique).toHaveBeenCalledWith({
      where: { usuarioId: userId },
    });
    expect(prisma.perfiles.create).toHaveBeenCalledWith({
      data: {
        usuarioId: userId,
        nombres: dto.firstName,
        apellidos: dto.lastName,
        telefono: dto.phone,
      },
    });
    expect(result).toBeDefined();
    expect(result.usuarioId).toBe(userId);
  });

  it('should throw ConflictException if profile already exists', async () => {
    const userId = 1;
    const dto = { firstName: 'John', lastName: 'Doe' };

    (prisma.perfiles.findUnique as jest.Mock).mockResolvedValue({
      perfilId: 1,
      usuarioId: userId,
    });

    await expect(useCase.execute(userId, dto as any)).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.perfiles.create).not.toHaveBeenCalled();
  });
});
