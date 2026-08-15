import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InstallMeterUseCase } from './install-meter.use-case';
import type { TransactionContext } from '../../../meters/domain/repositories/meter.repository';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor, EstadoContrato } from 'src/shared/enums';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  function makeTxMock() {
    return {
      historialMedidores: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      contratos: {
        update: jest.fn(),
      },
    };
  }

  let txMock: ReturnType<typeof makeTxMock>;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    findActiveContractForMeter: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(
      (cb: (tx: TransactionContext) => Promise<unknown>) => cb(txMock),
    ),
  };

  function makeMeter(overrides: Record<string, unknown> = {}) {
    return {
      medidorId: BigInt(1),
      marca: 'Marca',
      modelo: 'Modelo',
      serie: 'MED-001',
      estado: EstadoMedidor.PENDIENTE,
      fechaInstalacion: null,
      fechaBaja: null,
      motivo: null,
      latitud: null,
      longitud: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock = makeTxMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        InstallMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when meter does not exist', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when meter is not in PENDIENTE state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.INSTALADO }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when no active contract exists', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when contract is not PENDIENTE_INSTALACION', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.ACTIVO,
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should perform all three writes atomically: meter, historial close, contract', async () => {
    const installedMeter = makeMeter({
      estado: EstadoMedidor.INSTALADO,
      fechaInstalacion: new Date(),
    });
    const openHistorial = { historialId: BigInt(10) };

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.PENDIENTE_INSTALACION,
    });
    mockMeterRepository.update.mockResolvedValue(installedMeter);
    txMock.historialMedidores.findFirst.mockResolvedValue(openHistorial);

    const result = await useCase.execute(BigInt(1));

    expect(mockMeterRepository.update).toHaveBeenCalledTimes(1);
    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      expect.objectContaining({
        estado: EstadoMedidor.INSTALADO,
        fechaInstalacion: expect.any(Date),
      }),
      txMock,
    );

    expect(txMock.historialMedidores.findFirst).toHaveBeenCalledWith({
      where: { contratoId: BigInt(1), fechaHasta: null },
    });
    expect(txMock.historialMedidores.update).toHaveBeenCalledTimes(1);
    expect(txMock.historialMedidores.update).toHaveBeenCalledWith({
      where: { historialId: BigInt(10) },
      data: { fechaHasta: expect.any(Date) },
    });

    expect(txMock.contratos.update).toHaveBeenCalledTimes(1);
    expect(txMock.contratos.update).toHaveBeenCalledWith({
      where: { contratoId: BigInt(1) },
      data: { estado: EstadoContrato.ACTIVO },
    });

    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
    expect(result.fechaInstalacion).toBeInstanceOf(Date);
  });

  it('should skip historial close but still update meter and contract when no open historial exists', async () => {
    const installedMeter = makeMeter({
      estado: EstadoMedidor.INSTALADO,
      fechaInstalacion: new Date(),
    });

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.PENDIENTE_INSTALACION,
    });
    mockMeterRepository.update.mockResolvedValue(installedMeter);
    txMock.historialMedidores.findFirst.mockResolvedValue(null);

    const result = await useCase.execute(BigInt(1));

    expect(txMock.historialMedidores.update).not.toHaveBeenCalled();
    expect(txMock.contratos.update).toHaveBeenCalledTimes(1);
    expect(mockMeterRepository.update).toHaveBeenCalledTimes(1);
    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
  });
});
