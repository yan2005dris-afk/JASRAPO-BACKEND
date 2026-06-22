import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskStateUseCase } from './update-task-state.use-case';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';

describe('UpdateTaskStateUseCase', () => {
  let useCase: UpdateTaskStateUseCase;

  const mockOperatorRepository = {
    findActivePeriod: jest.fn(),
    findActiveRoutes: jest.fn(),
    findTasksByOperator: jest.fn(),
    updateTaskState: jest.fn(),
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
      nombre: 'Instalacion',
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
    it('should update meter to INSTALADO when completing INSTALACION task', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask(),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({ estado: 'COMPLETADA', fechaFin: new Date() }),
      );
      mockMeterRepository.update.mockResolvedValue({});

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(mockMeterRepository.update).toHaveBeenCalledWith(
        { medidorId: BigInt(100) },
        expect.objectContaining({
          estado: 'INSTALADO',
          fechaInstalacion: expect.any(Date),
        }),
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

      expect(mockMeterRepository.update).not.toHaveBeenCalled();
    });

    it('should NOT update meter when task has no medidorId', async () => {
      mockOperatorRepository.findActivePeriod.mockResolvedValue(
        mockActivePeriod,
      );
      mockOperatorRepository.findTasksByOperator.mockResolvedValue([
        makeTask({ medidorId: null }),
      ]);
      mockOperatorRepository.updateTaskState.mockResolvedValue(
        makeTask({
          estado: 'COMPLETADA',
          medidorId: null,
          fechaFin: new Date(),
        }),
      );

      await useCase.execute(BigInt(1), mockOperarioId, {
        estado: 'COMPLETADA',
      });

      expect(mockMeterRepository.update).not.toHaveBeenCalled();
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
