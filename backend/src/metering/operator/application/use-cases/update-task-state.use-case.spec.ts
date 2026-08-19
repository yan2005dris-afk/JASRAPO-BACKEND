import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { UpdateTaskStateUseCase } from './update-task-state.use-case';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

describe('UpdateTaskStateUseCase', () => {
  let useCase: UpdateTaskStateUseCase;

  const mockOperatorRepository = {
    findActivePeriod: jest.fn(),
    findActiveRoutes: jest.fn(),
    findTasksByOperator: jest.fn(),
    updateTaskState: jest.fn(),
    completeInstallationTask: jest.fn(),
    findOperatorsByGeography: jest.fn(),
    getMaxOrdenInZona: jest.fn(),
    findMeterContractLocation: jest.fn(),
    findMedidoresById: jest.fn(),
  };

  const mockActivePeriod = { periodoId: 10 };
  const mockOperarioId = 42;

  function makeTask(overrides: Record<string, any> = {}) {
    return {
      rutaId: BigInt(1),
      nombre: 'Lectura zona norte',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PENDIENTE',
      orden: 1,
      comunidadId: 5,
      sectorId: 3,
      operarioId: mockOperarioId,
      medidorId: null,
      observacion: null,
      fechaLimite: null,
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
      periodoId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  function makeInstallTask(overrides: Record<string, any> = {}) {
    return {
      rutaId: BigInt(1),
      nombre: 'Instalacion MED-001',
      tipoRuta: 'INSTALACION',
      estado: 'PENDIENTE',
      orden: 1,
      comunidadId: 5,
      sectorId: 3,
      operarioId: mockOperarioId,
      medidorId: BigInt(100),
      observacion: null,
      fechaLimite: null,
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
      periodoId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskStateUseCase,
        { provide: OperatorRepository, useValue: mockOperatorRepository },
      ],
    }).compile();

    useCase = module.get<UpdateTaskStateUseCase>(UpdateTaskStateUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('ownership validation', () => {
    it('should throw EntityNotFoundException when task does not exist', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([]);

      await expect(
        useCase.execute(BigInt(999), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw InvalidDomainOperationException when task belongs to another operator', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ operarioId: 99 }),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });
  });

  describe('state transitions', () => {
    it('should transition PENDIENTE → EN_PROGRESO', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({ estado: 'EN_PROGRESO', fechaInicio: new Date() }),
      );

      const result = await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'EN_PROGRESO',
      });

      expect(result.estado).toBe('EN_PROGRESO');
      expect(mockOperatorRepository.updateTaskState).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({
          estado: 'EN_PROGRESO',
          fechaInicio: expect.any(Date),
        }),
        'PENDIENTE',
      );
    });

    it('should transition PENDIENTE → COMPLETADA', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      );

      const result = await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(result.estado).toBe('COMPLETADA');
    });

    it('should transition EN_PROGRESO → COMPLETADA', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'EN_PROGRESO', fechaInicio: new Date() }),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      );

      const result = await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(result.estado).toBe('COMPLETADA');
    });

    it('should reject COMPLETADA → EN_PROGRESO (terminal)', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'EN_PROGRESO',
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should reject CANCELADA → EN_PROGRESO (terminal)', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'CANCELADA', observacion: 'Razon' }),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'EN_PROGRESO',
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should reject PENDIENTE → invalid state', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'PARCIAL' as any,
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });
  });

  describe('CANCELADA requires observacion', () => {
    it('should reject CANCELADA without observacion', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'CANCELADA',
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should reject CANCELADA with empty observacion', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'CANCELADA',
          observacion: '',
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should accept CANCELADA with observacion', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({
          estado: 'CANCELADA',
          observacion: 'Cliente no disponible',
        }),
      );

      const result = await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'CANCELADA',
        observacion: 'Cliente no disponible',
      });

      expect(result.estado).toBe('CANCELADA');
    });
  });

    it('should update task state when completing task', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeInstallTask(),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeInstallTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      );

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(mockOperatorRepository.updateTaskState).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({ estado: 'COMPLETADA' }),
        'PENDIENTE',
      );
    });
  describe('concurrency', () => {
    it('should propagate InvalidDomainOperationException from repo (P2025 translated in repo)', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'PENDIENTE' }),
      ]);
      mockOperatorRepository.updateTaskState.mockRejectedValueOnce(
        new InvalidDomainOperationException(
          'Conflicto de concurrencia: la tarea fue modificada por otro operario',
        ),
      );

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'EN_PROGRESO',
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should propagate non-P2025 errors without masking', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'PENDIENTE' }),
      ]);
      const dbError = new Error('Connection refused');
      mockOperatorRepository.updateTaskState.mockRejectedValueOnce(dbError);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'EN_PROGRESO',
        }),
      ).rejects.toThrow('Connection refused');
    });
  });

  describe('no active period', () => {
    it('should throw EntityNotFoundException when no active period', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(null);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
