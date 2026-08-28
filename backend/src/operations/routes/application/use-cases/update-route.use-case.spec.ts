import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateRouteUseCase } from './update-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateRouteUseCase', () => {
  let useCase: UpdateRouteUseCase;

  const mockRouteRepository = {
    findById: jest.fn(),
    findPeriodo: jest.fn(),
    findOverlappingRoutes: jest.fn(),
    update: jest.fn(),
    getReadingKpisByRutaId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRouteUseCase>(UpdateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException if route not found', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(1n, {} as any)).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException when updating to overlapping period', async () => {
    mockRouteRepository.findById.mockResolvedValue(
      new RouteEntity({
        rutaId: 1n,
        nombre: 'Route 1',
        operarioId: 1,
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 1,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    );
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 2,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([
      new RouteEntity({
        rutaId: 2n,
        nombre: 'Route 2',
        operarioId: 2,
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 2,
        estado: 'PENDIENTE',
        fechaPlanificada: null,
        fechaInicio: null,
        fechaFin: null,
      }),
    ]);

    await expect(useCase.execute(1n, { periodoId: 2 } as any)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should update periodoId successfully', async () => {
    const existing = new RouteEntity({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    const updated = new RouteEntity({
      ...existing,
      periodoId: 2,
    });

    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.findPeriodo.mockResolvedValue({
      periodoId: 2,
      estado: 'ABIERTO',
    });
    mockRouteRepository.findOverlappingRoutes.mockResolvedValue([]);
    mockRouteRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(1n, { periodoId: 2 });

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ periodoId: 2 }),
    );
    expect(result.periodoId).toBe(2);
  });

  it('should update route successfully with defined fields', async () => {
    const existing = new RouteEntity({
      rutaId: 1n,
      nombre: 'Old Name',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });
    const updated = new RouteEntity({
      ...existing,
      nombre: 'New Name',
      descripcion: 'New Desc',
    });

    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.update.mockResolvedValue(updated);

    await useCase.execute(1n, { nombre: 'New Name', descripcion: 'New Desc' });

    expect(mockRouteRepository.update).toHaveBeenCalledWith(1n, {
      nombre: 'New Name',
      descripcion: 'New Desc',
    });
  });

  it('should pass correct data when fechaPlanificada is set to null vs undefined', async () => {
    const existing = new RouteEntity({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaPlanificada: '2026-01-01',
      fechaInicio: null,
      fechaFin: null,
    });

    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.update.mockResolvedValue(existing);

    await useCase.execute(1n, {
      fechaPlanificada: null,
      nombre: undefined,
    } as any);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(1n, {
      fechaPlanificada: null,
    });
  });

  it('should keep COMPLETADA when all readings are approved', async () => {
    const existing = new RouteEntity({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'EN_PROGRESO',
      fechaPlanificada: null,
      fechaInicio: new Date(),
      fechaFin: null,
    });

    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.getReadingKpisByRutaId.mockResolvedValue({
      total: 3,
      aprobadas: 3,
      pendientes: 0,
      conNovedad: 0,
      rechazadas: 0,
    });
    mockRouteRepository.update.mockResolvedValue(existing);

    await useCase.execute(1n, { estado: 'COMPLETADA' } as any);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ estado: 'COMPLETADA' }),
    );
  });

  it('should downgrade to PARCIAL when there are unapproved readings', async () => {
    const existing = new RouteEntity({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
      estado: 'EN_PROGRESO',
      fechaPlanificada: null,
      fechaInicio: new Date(),
      fechaFin: null,
    });

    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.getReadingKpisByRutaId.mockResolvedValue({
      total: 3,
      aprobadas: 1,
      pendientes: 2,
      conNovedad: 0,
      rechazadas: 0,
    });
    mockRouteRepository.update.mockResolvedValue(existing);

    await useCase.execute(1n, { estado: 'COMPLETADA' } as any);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({ estado: 'PARCIAL' }),
    );
  });
});
