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
    findOverlappingRoutes: jest.fn(),
    paginateLecturas: jest.fn(),
  };

  beforeEach(async () => {
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
