import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InstallMeterUseCase } from './install-meter.use-case';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor, EstadoContrato } from 'src/shared/enums';

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    findActiveContractForMeter: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when meter is not in PENDIENTE state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.INSTALADO }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when no active contract exists', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when contract is not PENDIENTE_INSTALACION', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.ACTIVO,
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(BadRequestException);
  });

  it('should update meter to INSTALADO and return the updated entity within a transaction', async () => {
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

    const result = await useCase.execute(BigInt(1));

    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      expect.objectContaining({
        estado: EstadoMedidor.INSTALADO,
        fechaInstalacion: expect.any(Date),
      }),
      null,
    );
    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
    expect(result.fechaInstalacion).toBeInstanceOf(Date);
  });
});
