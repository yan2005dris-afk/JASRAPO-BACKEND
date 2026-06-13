import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateRouteUseCase } from './update-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    findPeriodo: jest.fn(),
    findOverlappingRoutes: jest.fn(),
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

  it('should throw BadRequestException when updating to overlapping period', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      deletedAt: null,
      comunidadId: 1,
      sectorId: null,
    });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 2,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([
      { rutaId: 2n },
    ]);
    mockRouteRepository.update.mockResolvedValue({
      rutaId: 1n,
      periodoId: 2,
      comunidadId: 1,
    });

    await expect(useCase.execute(1n, { periodoId: 2 } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update periodoId successfully', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      deletedAt: null,
      comunidadId: 1,
      sectorId: null,
    });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 2,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);
    mockRouteRepository.update.mockResolvedValue({
      rutaId: 1n,
      periodoId: 2,
    });

    await useCase.execute(1n, { periodoId: 2 });

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      { rutaId: 1n },
      expect.objectContaining({ periodoId: 2 }),
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
