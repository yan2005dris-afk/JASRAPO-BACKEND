import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRouteAssignmentsUseCase } from './create-route-assignments.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('CreateRouteAssignmentsUseCase', () => {
  let useCase: CreateRouteAssignmentsUseCase;

  const mockRouteRepository = {
    findUsuario: jest.fn(),
    findComunidad: jest.fn(),
    findSector: jest.fn(),
    findPeriodo: jest.fn(),
    findOverlappingRoutes: jest.fn(),
    create: jest.fn(),
    initializeMonthlyReadings: jest.fn(),
    findContratosByIds: jest.fn(),
    createWorkOrdersForContracts: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteAssignmentsUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateRouteAssignmentsUseCase>(
      CreateRouteAssignmentsUseCase,
    );
  });

  it('should throw EntityNotFoundException when operario is not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 99,
        comunidadId: 1,
        periodoId: 1,
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException when operario is not an operator', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'administrador' },
    });

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw EntityNotFoundException when comunidad is not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 99,
        periodoId: 1,
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException when periodo is not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 99,
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException when periodo is closed', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'CERRADO',
    });

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should create 1 route for entire community when sectorIds is empty', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({
      comunidadId: 1,
      nombre: 'Comuna Centro',
    });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const createdRoute = new RouteEntity({
      rutaId: 10n,
      nombre: 'Ruta Lectura - Comunidad 1',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(createdRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].rutaId).toBe(10n);
    expect(mockRouteRepository.initializeMonthlyReadings).toHaveBeenCalledWith(
      1,
      1,
      expect.any(Date),
      null,
      10n,
    );
  });

  it('should throw when sector does not exist or does not belong to comunidad', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findSector.mockResolvedValueOnce({
      sectorId: 5,
      comunidadId: 999, // mismatch
    });

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
        sectorIds: [5],
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should create multiple routes when multiple sectorIds are provided', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findSector
      .mockResolvedValueOnce({
        sectorId: 1,
        comunidadId: 1,
        nombre: 'Barrio Norte',
      })
      .mockResolvedValueOnce({
        sectorId: 2,
        comunidadId: 1,
        nombre: 'Barrio Sur',
      });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const route1 = new RouteEntity({
      rutaId: 101n,
      nombre: 'Ruta - Barrio Norte',
      operarioId: 1,
      comunidadId: 1,
      sectorId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaInicio: null,
      fechaFin: null,
    });
    const route2 = new RouteEntity({
      rutaId: 102n,
      nombre: 'Ruta - Barrio Sur',
      operarioId: 1,
      comunidadId: 1,
      sectorId: 2,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaInicio: null,
      fechaFin: null,
    });

    mockRouteRepository.create
      .mockResolvedValueOnce(route1)
      .mockResolvedValueOnce(route2);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
      sectorIds: [1, 2],
      nombreBase: 'Ruta Mensual',
    });

    expect(result).toHaveLength(2);
    expect(mockRouteRepository.create).toHaveBeenCalledTimes(2);
    expect(mockRouteRepository.initializeMonthlyReadings).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should create route with contract guide numbers in name when contratoIds are provided', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({
      comunidadId: 1,
      nombre: 'Comuna Centro',
    });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findContratosByIds.mockResolvedValue([
      { contratoId: 10, numeroGuia: 'CTR-001', comunidadId: 1 },
      { contratoId: 20, numeroGuia: 'CTR-002', comunidadId: 1 },
    ]);

    const createdRoute = new RouteEntity({
      rutaId: 50n,
      nombre: 'Ruta Inspección - Contratos CTR-001, CTR-002',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSPECCION',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(createdRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
      tipoRuta: 'INSPECCION',
      contratoIds: [10, 20],
      nombreBase: 'Ruta Inspección',
    });

    expect(result).toHaveLength(1);
    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ruta Inspección - Contratos CTR-001, CTR-002',
        tipoRuta: 'INSPECCION',
      }),
    );
    expect(
      mockRouteRepository.createWorkOrdersForContracts,
    ).toHaveBeenCalledWith(50n, [10, 20]);
  });

  it('should throw InvalidDomainOperationException when sector already has overlapping route in period', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findSector.mockResolvedValue({
      sectorId: 1,
      comunidadId: 1,
      nombre: 'Sector A',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([
      new RouteEntity({
        rutaId: 99n,
        nombre: 'Ruta Existente',
        operarioId: 2,
        comunidadId: 1,
        sectorId: 1,
        tipoRuta: 'LECTURA',
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaInicio: null,
        fechaFin: null,
      }),
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
        sectorIds: [1],
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException when entire community has overlapping route in period', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([
      new RouteEntity({
        rutaId: 99n,
        nombre: 'Ruta Existente Comunidad',
        operarioId: 2,
        comunidadId: 1,
        tipoRuta: 'LECTURA',
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaInicio: null,
        fechaFin: null,
      }),
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should deduplicate sectorIds when passed duplicate entries in the array', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findSector.mockResolvedValue({
      sectorId: 1,
      comunidadId: 1,
      nombre: 'Sector Único',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);
    mockRouteRepository.create.mockResolvedValue(
      new RouteEntity({
        rutaId: 101n,
        nombre: 'Ruta - Sector Único',
        operarioId: 1,
        comunidadId: 1,
        sectorId: 1,
        tipoRuta: 'LECTURA',
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaInicio: null,
        fechaFin: null,
      }),
    );

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
      sectorIds: [1, 1, 1], // Duplicates
    });

    expect(result).toHaveLength(1);
    expect(mockRouteRepository.create).toHaveBeenCalledTimes(1);
  });
});
