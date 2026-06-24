import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskStateUseCase } from './update-task-state.use-case';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';

/** Create a duck-typed Prisma P2025 error (matches isP2025Error in the use case). */
function makeP2025Error(): Error & { code: string } {
  const err = new Error('RecordNotFound');
  err.name = 'PrismaClientKnownRequestError';
  (err as Error & { code: string }).code = 'P2025';
  return err as Error & { code: string };
}

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

  const mockMeterRepository = {
    update: jest.fn(),
    findUnique: jest.fn(),
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
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskStateUseCase,
        { provide: OperatorRepository, useValue: mockOperatorRepository },
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<UpdateTaskStateUseCase>(UpdateTaskStateUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('ownership validation', () => {
    it('should throw NotFoundException when task does not exist', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([]);

      await expect(
        useCase.execute(BigInt(999), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when task belongs to another operator', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ operarioId: 99 }),
      ]);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(ForbiddenException);
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
      ).rejects.toThrow(BadRequestException);
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
      ).rejects.toThrow(BadRequestException);
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
      ).rejects.toThrow(BadRequestException);
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
      ).rejects.toThrow(BadRequestException);
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
      ).rejects.toThrow(BadRequestException);
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

  describe('COMPLETADA de INSTALACION actualiza medidor', () => {
    it('should update meter to INSTALADO atomically when completing INSTALACION task', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeInstallTask(),
      ]);
      mockOperatorRepository.completeInstallationTask.mockResolvedValue(
        makeInstallTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      );

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(
        mockOperatorRepository.completeInstallationTask,
      ).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({ estado: 'COMPLETADA' }),
        'PENDIENTE',
        {
          medidorId: BigInt(100),
          estado: 'INSTALADO',
          fechaInstalacion: expect.any(Date),
        },
      );
    });

    it('should NOT update meter when completing non-INSTALACION task', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ tipoRuta: 'INSPECCION', medidorId: null }),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({
          tipoRuta: 'INSPECCION',
          estado: 'COMPLETADA',
          fechaFin: new Date(),
        }),
      );

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(
        mockOperatorRepository.completeInstallationTask,
      ).not.toHaveBeenCalled();
      expect(mockMeterRepository.update).not.toHaveBeenCalled();
    });

    it('should NOT update meter when task has no medidorId', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeInstallTask({ medidorId: null }),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeInstallTask({
          estado: 'COMPLETADA',
          medidorId: null,
          fechaFin: new Date(),
        }),
      );

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(
        mockOperatorRepository.completeInstallationTask,
      ).not.toHaveBeenCalled();
      expect(mockMeterRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('concurrency', () => {
    it('should detect concurrent modifications and throw ConflictException', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ estado: 'PENDIENTE' }),
      ]);
      mockOperatorRepository.updateTaskState.mockRejectedValueOnce(
        makeP2025Error(),
      );

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'EN_PROGRESO',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle concurrent INSTALACION completion safely', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeInstallTask(),
      ]);
      mockOperatorRepository.completeInstallationTask.mockRejectedValueOnce(
        makeP2025Error(),
      );

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'COMPLETADA',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate non-P2025 errors without masking as ConflictException', async () => {
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

    it('should propagate non-P2025 errors from INSTALACION completion', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeInstallTask(),
      ]);
      const dbError = new Error('Connection refused');
      mockOperatorRepository.completeInstallationTask.mockRejectedValueOnce(
        dbError,
      );

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, {
          estado: 'COMPLETADA',
        }),
      ).rejects.toThrow('Connection refused');
    });
  });

  describe('no active period', () => {
    it('should throw NotFoundException when no active period', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(null);

      await expect(
        useCase.execute(BigInt(1), mockOperarioId, { estado: 'EN_PROGRESO' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
