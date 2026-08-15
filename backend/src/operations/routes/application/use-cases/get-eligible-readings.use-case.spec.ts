import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEligibleReadingsUseCase } from './get-eligible-readings.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('GetEligibleReadingsUseCase', () => {
  let useCase: GetEligibleReadingsUseCase;

  const mockRouteRepository = {
    findComunidad: jest.fn(),
    findSector: jest.fn(),
    paginateLecturas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEligibleReadingsUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetEligibleReadingsUseCase>(
      GetEligibleReadingsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException if comunidad not found', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue(null);
    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException if sector not found', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findSector.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException if sector does not belong to comunidad', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findSector.mockResolvedValue({
      sectorId: 2,
      comunidadId: 99,
    });

    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should delegate to paginateLecturas with criteria and return paginated data', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });

    const mappedEntity = new ReadingForRouteEntity({
      lecturaId: 10n,
      guia: 'G-123',
      clienteNombre: 'Juan Perez',
      direccion: 'Dir 1',
      sector: 'Sector 1',
      estadoContrato: 'ACTIVO',
    });

    mockRouteRepository.paginateLecturas.mockResolvedValue({
      data: [mappedEntity],
      meta: {
        total: 1,
        page: 2,
        limit: 15,
        ultimaPagina: 1,
        paginaActual: 2,
        porPagina: 15,
        anterior: 1,
        siguiente: null,
      },
    });

    const result = await useCase.execute({
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      pagination: { page: 2, limit: 15 },
      search: 'Juan',
    });

    expect(mockRouteRepository.paginateLecturas).toHaveBeenCalledWith(
      {
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: undefined,
        search: 'Juan',
      },
      { skip: 15, take: 15, page: 2 },
    );

    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].lecturaId).toBe(10n);
    expect(result.data[0].clienteNombre).toBe('Juan Perez');
  });
});
