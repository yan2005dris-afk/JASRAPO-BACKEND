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

  it('should create route successfully', async () => {
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.findComunidad.mockResolvedValue({ comunidadId: 1 });

    const mockCreatedRoute = {
      rutaId: 100n,
      nombre: 'Test Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
    };
    mockRouteRepository.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      nombre: 'Test Route',
    } as any);

    expect(mockRouteRepository.create).toHaveBeenCalled();
    expect(result.rutaId).toBe(100n);
    expect(result.nombre).toBe('Test Route');
  });
});
