import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneRouteUseCase } from './find-one-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOneRouteUseCase', () => {
  let useCase: FindOneRouteUseCase;

  const mockRouteRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    paginateRutas: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUsuario: jest.fn(),
    findComunidad: jest.fn(),
    findSector: jest.fn(),
    paginateLecturas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneRouteUseCase>(FindOneRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    mockRouteRepository.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
  });

  it('should return mapped RouteEntity if route is found', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      nombre: 'Route 1',
      deletedAt: null,
    });

    const result = await useCase.execute(1n);

    expect(mockRouteRepository.findUnique).toHaveBeenCalledWith({ rutaId: 1n });
    expect(result.rutaId).toBe(1n);
    expect(result.nombre).toBe('Route 1');
  });
});
