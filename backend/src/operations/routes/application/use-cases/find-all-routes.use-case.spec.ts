import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllRoutesUseCase } from './find-all-routes.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { routeRow } from '../../__test-utils__/route-row.factory';

describe('FindAllRoutesUseCase', () => {
  let useCase: FindAllRoutesUseCase;

  const mockRouteRepository = {
    paginateRutas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRoutesUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllRoutesUseCase>(FindAllRoutesUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call paginateRutas with correct params and return results', async () => {
    const mockEntities = [
      routeRow({
        rutaId: 1n,
        nombre: 'Route 1',
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaInicio: null,
        fechaFin: null,
        tipoActividad: { codigo: 'LECTURA' },
      }),
      routeRow({
        rutaId: 2n,
        nombre: 'Route 2',
        operarioId: 2,
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaInicio: null,
        fechaFin: null,
        tipoActividad: { codigo: 'LECTURA' },
      }),
    ];

    mockRouteRepository.paginateRutas.mockResolvedValue({
      data: mockEntities,
      meta: { total: 2, page: 1, limit: 10 },
    });

    const result = await useCase.execute({
      pagination: { page: 1, limit: 10 },
      where: { estado: 'PENDIENTE' },
    });

    expect(mockRouteRepository.paginateRutas).toHaveBeenCalledWith(
      { estado: 'PENDIENTE' },
      { skip: 0, take: 10, page: 1 },
    );
    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].rutaId).toBe(1n);
    expect(result.data[0].nombre).toBe('Route 1');
  });
});
