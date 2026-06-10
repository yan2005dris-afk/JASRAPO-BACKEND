import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateRouteUseCase } from './update-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateRouteUseCase', () => {
  let useCase: UpdateRouteUseCase;

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
        UpdateRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRouteUseCase>(UpdateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    mockRouteRepository.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n, {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update route successfully with defined fields', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      deletedAt: null,
    });
    mockRouteRepository.update.mockResolvedValue({
      rutaId: 1n,
      nombre: 'New Name',
    });

    await useCase.execute(1n, { nombre: 'New Name', descripcion: 'New Desc' });

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      { rutaId: 1n },
      {
        nombre: 'New Name',
        descripcion: 'New Desc',
      },
    );
  });

  it('should pass correct data when fechaPlanificada is set to null vs undefined', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      deletedAt: null,
    });
    mockRouteRepository.update.mockResolvedValue({ rutaId: 1n });

    await useCase.execute(1n, {
      fechaPlanificada: null,
      nombre: undefined,
    } as any);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      { rutaId: 1n },
      {
        fechaPlanificada: null,
      },
    );
  });
});
