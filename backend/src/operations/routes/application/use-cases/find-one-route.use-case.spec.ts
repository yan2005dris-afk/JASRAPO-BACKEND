import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneRouteUseCase } from './find-one-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneRouteUseCase', () => {
  let useCase: FindOneRouteUseCase;

  const mockRouteRepository = {
    findById: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException if route not found', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(EntityNotFoundException);
  });

  it('should return RouteEntity if route is found', async () => {
    const expected = new RouteEntity({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.findById.mockResolvedValue(expected);

    const result = await useCase.execute(1n);

    expect(mockRouteRepository.findById).toHaveBeenCalledWith(1n);
    expect(result).toEqual(expected);
  });
});
