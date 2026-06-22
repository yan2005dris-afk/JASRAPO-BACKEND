import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReassignRouteUseCase } from './reassign-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ReassignRouteUseCase', () => {
  let useCase: ReassignRouteUseCase;

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
        ReassignRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<ReassignRouteUseCase>(ReassignRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route does not exist', async () => {
    mockRouteRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1n, 10)).rejects.toThrow(NotFoundException);

    expect(mockRouteRepository.findUnique).toHaveBeenCalledWith({ rutaId: 1n });
  });

  it('should throw NotFoundException if target operator does not exist', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      operarioId: 5,
      nombre: 'Test Route',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
    });
    mockRouteRepository.findUsuario.mockResolvedValue(null);

    await expect(useCase.execute(1n, 10)).rejects.toThrow(NotFoundException);

    expect(mockRouteRepository.findUsuario).toHaveBeenCalledWith(
      { usuarioId: 10 },
      { include: { rol: true } },
    );
  });

  it('should throw BadRequestException if target user is not an operator', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      operarioId: 5,
      nombre: 'Test Route',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
    });
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'admin' },
    });

    await expect(useCase.execute(1n, 10)).rejects.toThrow(BadRequestException);
  });

  it('should throw ForbiddenException when reassigning to the same operator', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      operarioId: 10,
      nombre: 'Test Route',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
    });
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'operadores' },
    });

    await expect(useCase.execute(1n, 10)).rejects.toThrow(ForbiddenException);
  });

  it('should reassign route to a different operator successfully', async () => {
    const existingRoute = {
      rutaId: 1n,
      operarioId: 5,
      nombre: 'Test Route',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
      comunidadId: 1,
      periodoId: 1,
    };

    const updatedRoute = { ...existingRoute, operarioId: 10 };

    mockRouteRepository.findUnique.mockResolvedValue(existingRoute);
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.update.mockResolvedValue(updatedRoute);

    const result = await useCase.execute(1n, 10);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      { rutaId: 1n },
      { operarioId: 10 },
    );
    expect(result.rutaId).toBe(1n);
    expect(result.operarioId).toBe(10);
  });
});
