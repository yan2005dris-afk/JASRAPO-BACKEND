import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReassignRouteUseCase } from './reassign-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('ReassignRouteUseCase', () => {
  let useCase: ReassignRouteUseCase;

  const mockRouteRepository = {
    findById: jest.fn(),
    findUsuario: jest.fn(),
    update: jest.fn(),
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

  it('should throw EntityNotFoundException if route does not exist', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1n, 10)).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockRouteRepository.findById).toHaveBeenCalledWith(1n);
  });

  it('should throw EntityNotFoundException if target operator does not exist', async () => {
    mockRouteRepository.findById.mockResolvedValue(
      new RouteEntity({
        rutaId: 1n,
        operarioId: 5,
        nombre: 'Test Route',
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    );
    mockRouteRepository.findUsuario.mockResolvedValue(null);

    await expect(useCase.execute(1n, 10)).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockRouteRepository.findUsuario).toHaveBeenCalledWith(10, {
      includeRole: true,
    });
  });

  it('should throw InvalidDomainOperationException if target user is not an operator', async () => {
    mockRouteRepository.findById.mockResolvedValue(
      new RouteEntity({
        rutaId: 1n,
        operarioId: 5,
        nombre: 'Test Route',
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    );
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'admin' },
    });

    await expect(useCase.execute(1n, 10)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should throw InvalidDomainOperationException when reassigning to the same operator', async () => {
    mockRouteRepository.findById.mockResolvedValue(
      new RouteEntity({
        rutaId: 1n,
        operarioId: 10,
        nombre: 'Test Route',
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    );
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'operadores' },
    });

    await expect(useCase.execute(1n, 10)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should reassign route to a different operator successfully', async () => {
    const existingRoute = new RouteEntity({
      rutaId: 1n,
      operarioId: 5,
      nombre: 'Test Route',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
      comunidadId: 1,
      periodoId: 1,
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });

    const updatedRoute = new RouteEntity({
      ...existingRoute,
      operarioId: 10,
    });

    mockRouteRepository.findById.mockResolvedValue(existingRoute);
    mockRouteRepository.findUsuario.mockResolvedValue({
      usuarioId: 10,
      rol: { nombre: 'operadores' },
    });
    mockRouteRepository.update.mockResolvedValue(updatedRoute);

    const result = await useCase.execute(1n, 10);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(1n, {
      operarioId: 10,
    });
    expect(result.rutaId).toBe(1n);
    expect(result.operarioId).toBe(10);
  });
});
