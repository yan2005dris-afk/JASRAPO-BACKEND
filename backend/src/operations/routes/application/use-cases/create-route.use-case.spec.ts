import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRouteUseCase } from './create-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CreateRouteUseCase', () => {
  let useCase: CreateRouteUseCase;

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
    findMedidor: jest.fn(),
    findOverlappingRoutes: jest.fn(),
    paginateLecturas: jest.fn(),
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

  it('should throw NotFoundException if operario not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue(null);
    await expect(useCase.execute({ operarioId: 1 } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if operario is not an operator', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'admin' },
    });

    await expect(useCase.execute({ operarioId: 1 } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException if comunidad not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue(null);

    await expect(
      useCase.execute({ operarioId: 1, comunidadId: 2 } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if sector not found', async () => {
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
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if sector does not belong to comunidad', async () => {
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
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if periodo not found', async () => {
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
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if periodo is not ABIERTO', async () => {
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
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if overlapping GENERAL exists', async () => {
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
      { rutaId: 1n },
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      undefined,
    );
  });

  it('should throw BadRequestException if overlapping SECTORIAL same sector', async () => {
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
      { rutaId: 1n },
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        periodoId: 1,
        sectorId: 2,
      } as any),
    ).rejects.toThrow(BadRequestException);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      2,
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
    // Repository filters by sectorId, so overlaps in a different sector
    // are not returned — empty result means creation is allowed.
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);

    const mockCreatedRoute = {
      rutaId: 400n,
      nombre: 'Different Sector Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      periodoId: 1,
      sectorId: 3,
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      nombre: 'Different Sector Route',
      periodoId: 1,
      sectorId: 3,
    } as any);

    expect(mockRouteRepository.findOverlappingRoutes).toHaveBeenCalledWith(
      1,
      1,
      3,
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

    const mockCreatedRoute = {
      rutaId: 200n,
      nombre: 'Route With Periodo',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      periodoId: 1,
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
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

    const mockCreatedRoute = {
      rutaId: 300n,
      nombre: 'Periodo Test',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      periodoId: 5,
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      nombre: 'Periodo Test',
      periodoId: 5,
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ periodoId: 5 }),
    );
    expect(result.periodoId).toBe(5);
  });

  it('should throw NotFoundException if medidorId is provided but medidor not found', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findMedidor.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        tipoRuta: 'INSTALACION',
        nombre: 'Install Task',
        periodoId: 1,
        medidorId: 99,
      } as any),
    ).rejects.toThrow(NotFoundException);

    expect(mockRouteRepository.findMedidor).toHaveBeenCalledWith({
      medidorId: 99,
    });
  });

  it('should skip overlap check for INSTALACION tipoRuta', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findMedidor.mockResolvedValue({
      medidorId: 42,
      serie: 'MED-042',
    });

    const mockCreatedRoute = {
      rutaId: 500n,
      nombre: 'Instalación MED-042',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSTALACION',
      periodoId: 1,
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSTALACION',
      nombre: 'Instalación MED-042',
      periodoId: 1,
      medidorId: 42,
    } as any);

    // Overlap check should NOT be called for work order types
    expect(mockRouteRepository.findOverlappingRoutes).not.toHaveBeenCalled();
    expect(mockRouteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ medidorId: 42, tipoRuta: 'INSTALACION' }),
    );
  });

  it('should skip overlap check for INSPECCION tipoRuta', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 1,
      estado: 'ABIERTO',
    });

    const mockCreatedRoute = {
      rutaId: 501n,
      nombre: 'Inspección Comunidad 1',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'INSPECCION',
      periodoId: 1,
    };
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

    const mockCreatedRoute = {
      rutaId: 100n,
      nombre: 'Test Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      periodoId: 1,
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      nombre: 'Test Route',
      periodoId: 1,
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalled();
    expect(result.rutaId).toBe(100n);
    expect(result.nombre).toBe('Test Route');
    expect(result.periodoId).toBe(1);
  });
});
