import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEligibleReadingsUseCase } from './get-eligible-readings.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoContrato } from 'src/shared/enums';

describe('GetEligibleReadingsUseCase', () => {
  let useCase: GetEligibleReadingsUseCase;

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
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if comunidad not found', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue(null);
    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if sector not found', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findSector.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if sector does not belong to comunidad', async () => {
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
    ).rejects.toThrow(BadRequestException);
  });

  it('should build correct where clause for TOMA_LECTURA and return paginated mapped data', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });

    // paginateLecturas now returns ReadingForRouteEntity[] — repo does mapping internally
    const mappedEntity = {
      lecturaId: 10n,
      guia: 'G-123',
      clienteNombre: 'Juan Perez',
      direccion: 'Dir 1',
      sector: 'Sector 1',
      estadoContrato: 'ACTIVO',
    };

    mockRouteRepository.paginateLecturas.mockResolvedValue({
      data: [mappedEntity],
      meta: { total: 1, page: 2, limit: 15 },
    });

    const result = await useCase.execute({
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      pagination: { page: 2, limit: 15 },
      search: ' Juan ',
    });

    expect(mockRouteRepository.paginateLecturas).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          estadoAsignacion: 'NO_ASIGNADA',
          medidor: expect.objectContaining({
            historial: expect.objectContaining({
              some: expect.objectContaining({
                contrato: expect.objectContaining({
                  estado: EstadoContrato.ACTIVO,
                  comunidadId: 1,
                }),
              }),
            }),
          }),
          OR: expect.arrayContaining([
            expect.objectContaining({
              medidor: expect.objectContaining({
                historial: expect.objectContaining({
                  some: expect.objectContaining({
                    contrato: expect.objectContaining({
                      cliente: expect.objectContaining({
                        nombres: expect.objectContaining({ contains: 'Juan' }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          ]),
        }),
      }),
      { page: 2, limit: 15 },
    );

    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].lecturaId).toBe(10n);
    expect(result.data[0].clienteNombre).toBe('Juan Perez');
  });

  it('should build correct where clause for RECONEXION type', async () => {
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.paginateLecturas.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10 },
    });

    await useCase.execute({
      tipoRuta: 'RECONEXION',
      comunidadId: 1,
      pagination: { page: 1, limit: 10 },
    });

    expect(mockRouteRepository.paginateLecturas).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          medidor: expect.objectContaining({
            historial: expect.objectContaining({
              some: expect.objectContaining({
                contrato: expect.objectContaining({
                  estado: EstadoContrato.RECONEXION,
                }),
              }),
            }),
          }),
        }),
      }),
      { page: 1, limit: 10 },
    );
  });
});
