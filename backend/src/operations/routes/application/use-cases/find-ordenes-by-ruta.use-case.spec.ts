import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOrdenesByRutaUseCase } from './find-ordenes-by-ruta.use-case';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type {
  PaginatedResult,
  PaginationMeta,
} from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

describe('FindOrdenesByRutaUseCase', () => {
  let useCase: FindOrdenesByRutaUseCase;

  const mockOrdenTrabajoRepository = {
    findByRutaId: jest.fn(),
  };

  const mockRouteRepository = {
    findById: jest.fn(),
  };

  const makeMeta = (total: number, page = 1, limit = 10): PaginationMeta => ({
    total,
    page,
    limit,
    ultimaPagina: Math.max(1, Math.ceil(total / limit)),
    paginaActual: page,
    porPagina: limit,
    anterior: page > 1 ? page - 1 : null,
    siguiente: total > page * limit ? page + 1 : null,
  });

  const sampleOrden = new OrdenTrabajoEntity({
    ordenTrabajoId: 1n,
    rutaId: 10n,
    contratoId: 100n,
    medidorId: 200n,
    tipoActividad: 'INSTALACION',
    estado: 'PENDIENTE',
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
  });

  const sampleRuta = {
    rutaId: 10n,
    nombre: 'Ruta Test',
    operarioId: 1,
    tipoRuta: 'INSTALACION',
    comunidadId: 1,
    periodoId: 1,
    estado: 'PENDIENTE',
    fechaPlanificada: null,
    fechaInicio: null,
    fechaFin: null,
  };

  const pagination: PaginateOptions = { page: 1, limit: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOrdenesByRutaUseCase,
        {
          provide: OrdenTrabajoRepository,
          useValue: mockOrdenTrabajoRepository,
        },
        { provide: RouteRepository, useValue: mockRouteRepository },
      ],
    }).compile();

    useCase = module.get<FindOrdenesByRutaUseCase>(FindOrdenesByRutaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException when route does not exist', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ rutaId: 99n, pagination })).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockRouteRepository.findById).toHaveBeenCalledWith(99n);
    expect(mockOrdenTrabajoRepository.findByRutaId).not.toHaveBeenCalled();
  });

  it('should call repository with correct filters when estado is provided', async () => {
    mockRouteRepository.findById.mockResolvedValue(sampleRuta);
    const paginatedResult: PaginatedResult<OrdenTrabajoEntity> = {
      data: [sampleOrden],
      meta: makeMeta(1),
    };
    mockOrdenTrabajoRepository.findByRutaId.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({
      rutaId: 10n,
      filters: { estado: 'COMPLETADA' },
      pagination,
    });

    expect(mockRouteRepository.findById).toHaveBeenCalledWith(10n);
    expect(mockOrdenTrabajoRepository.findByRutaId).toHaveBeenCalledWith(
      10n,
      { rutaId: 10n, estado: 'COMPLETADA' },
      pagination,
    );
    expect(result).toEqual(paginatedResult);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBe(sampleOrden);
  });

  it('should call repository without estado filter when none is provided', async () => {
    mockRouteRepository.findById.mockResolvedValue(sampleRuta);
    mockOrdenTrabajoRepository.findByRutaId.mockResolvedValue({
      data: [],
      meta: makeMeta(0),
    });

    await useCase.execute({ rutaId: 10n, pagination });

    expect(mockOrdenTrabajoRepository.findByRutaId).toHaveBeenCalledWith(
      10n,
      { rutaId: 10n, estado: undefined },
      pagination,
    );
  });

  it('should return empty paginated result when route has no ordenes', async () => {
    mockRouteRepository.findById.mockResolvedValue(sampleRuta);
    mockOrdenTrabajoRepository.findByRutaId.mockResolvedValue({
      data: [],
      meta: makeMeta(0),
    });

    const result = await useCase.execute({ rutaId: 10n, pagination });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should pass through kpis from the repository', async () => {
    mockRouteRepository.findById.mockResolvedValue(sampleRuta);
    mockOrdenTrabajoRepository.findByRutaId.mockResolvedValue({
      data: [sampleOrden],
      meta: { total: 3, page: 1, limit: 10 },
      kpis: {
        total: 3,
        completadas: 1,
        pendientes: 1,
        conNovedad: 1,
        canceladas: 0,
      },
    });

    const result = await useCase.execute({ rutaId: 10n, pagination });

    expect(result.kpis).toEqual({
      total: 3,
      completadas: 1,
      pendientes: 1,
      conNovedad: 1,
      canceladas: 0,
    });
  });
});
