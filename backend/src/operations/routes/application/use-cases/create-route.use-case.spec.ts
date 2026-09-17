import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRouteUseCase } from './create-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('CreateRouteUseCase', () => {
  let useCase: CreateRouteUseCase;

  const mockRouteRepository = {
    findUsuario: jest.fn(),
    findComunidad: jest.fn(),
    findSector: jest.fn(),
    findPeriodo: jest.fn(),
    findMedidor: jest.fn(),
    findOverlappingRoutes: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException if operario not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue(null);
    await expect(useCase.execute({ operarioId: 1 } as any)).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException if operario is not an operator', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'admin' },
    });

    await expect(useCase.execute({ operarioId: 1 } as any)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should throw EntityNotFoundException if comunidad not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue(null);

    await expect(
      useCase.execute({ operarioId: 1, comunidadId: 2 } as any),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException if sector not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findSector.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        sectorId: 2,
      } as any),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException if sector does not belong to comunidad', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findSector.mockResolvedValue({
      sectorId: 2,
      comunidadId: 99,
    });

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        sectorId: 2,
      } as any),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw EntityNotFoundException if periodo not found', async () => {
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
        periodoId: 9999,
      } as any),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException if periodo is not ABIERTO', async () => {
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
      } as any),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException if overlapping GENERAL exists', async () => {
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
        rutaId: 1n,
        nombre: 'Overlapping',
        operarioId: 1,
        tipoRuta: 'LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
      } as any),
    ).rejects.toThrow(InvalidDomainOperationException);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      undefined,
      null,
      undefined,
    );
  });

  it('should throw InvalidDomainOperationException if overlapping SECTORIAL same sector', async () => {
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
      sectorId: 2,
      comunidadId: 1,
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([
      new RouteEntity({
        rutaId: 1n,
        nombre: 'Overlapping',
        operarioId: 1,
        tipoRuta: 'LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
        sectorId: 2,
      } as any),
    ).rejects.toThrow(InvalidDomainOperationException);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      2,
      null,
      undefined,
    );
  });

  it('should allow create if overlapping SECTORIAL different sector', async () => {
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
      sectorId: 3,
      comunidadId: 1,
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const mockCreatedRoute = new RouteEntity({
      rutaId: 400n,
      nombre: 'Different Sector Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      sectorId: 3,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      nombre: 'Different Sector Route',
      periodoId: 1,
      sectorId: 3,
    } as any);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      3,
      null,
      'LECTURA',
    );
    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ sectorId: 3 }),
    );
    expect(result.rutaId).toBe(400n);
  });

  it('should create route with periodoId when no overlap', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const mockCreatedRoute = new RouteEntity({
      rutaId: 200n,
      nombre: 'Route With Periodo',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      nombre: 'Route With Periodo',
      periodoId: 1,
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalled();
    expect(result.periodoId).toBe(1);
  });

  it('should pass periodoId in CreateRouteData', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 5,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const mockCreatedRoute = new RouteEntity({
      rutaId: 300n,
      nombre: 'Periodo Test',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 5,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      nombre: 'Periodo Test',
      periodoId: 5,
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ periodoId: 5 }),
    );
    expect(result.periodoId).toBe(5);
  });

  it('should allow creating INSTALACION routes without overlap validation', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });

    const mockCreatedRoute = new RouteEntity({
      rutaId: 500n,
      nombre: 'Instalación Olón',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSTALACION',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSTALACION',
      nombre: 'Instalación Olón',
      periodoId: 1,
    } as any);

    expect(mockRouteRepository.findOverlappingRoutes).not.toHaveBeenCalled();
    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipoRuta: 'INSTALACION' }),
    );
  });

  it('should allow creating INSPECCION routes without overlap validation', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });

    const mockCreatedRoute = new RouteEntity({
      rutaId: 501n,
      nombre: 'Inspección Comunidad 1',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSPECCION',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSPECCION',
      nombre: 'Inspección Comunidad 1',
      periodoId: 1,
    } as any);

    expect(mockRouteRepository.findOverlappingRoutes).not.toHaveBeenCalled();
  });

  it('should create route successfully', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const mockCreatedRoute = new RouteEntity({
      rutaId: 100n,
      nombre: 'Test Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'LECTURA',
      nombre: 'Test Route',
      periodoId: 1,
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalled();
    expect(result.rutaId).toBe(100n);
    expect(result.nombre).toBe('Test Route');
    expect(result.periodoId).toBe(1);
  });
});
