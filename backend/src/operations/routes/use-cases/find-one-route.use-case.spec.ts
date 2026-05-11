import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneRouteUseCase } from './find-one-route.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FindOneRouteUseCase', () => {
  let useCase: FindOneRouteUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      rutas: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneRouteUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindOneRouteUseCase>(FindOneRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    prismaService.rutas.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
  });

  it('should return mapped RouteEntity if route is found', async () => {
    prismaService.rutas.findUnique.mockResolvedValue({ rutaId: 1n, nombre: 'Route 1', deletedAt: null });
    
    const result = await useCase.execute(1n);

    expect(prismaService.rutas.findUnique).toHaveBeenCalledWith({
      where: { rutaId: 1n },
    });
    expect(result.rutaId).toBe(1n);
    expect(result.nombre).toBe('Route 1');
  });
});
