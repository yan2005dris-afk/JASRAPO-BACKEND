import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRouteUseCase } from './create-route.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CreateRouteUseCase', () => {
  let useCase: CreateRouteUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      usuarios: { findUnique: jest.fn() },
      comunidades: { findUnique: jest.fn() },
      sectores: { findUnique: jest.fn() },
      lecturas: { findMany: jest.fn(), updateMany: jest.fn() },
      rutas: { create: jest.fn() },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if operario not found', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue(null);
    await expect(
      useCase.execute({ operarioId: 1, lecturaIds: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
