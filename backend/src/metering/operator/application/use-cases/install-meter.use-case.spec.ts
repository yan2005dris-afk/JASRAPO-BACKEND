import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { InstallMeterUseCase } from './install-meter.use-case';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor, EstadoContrato } from 'src/shared/enums';

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    findActiveContractForMeter: jest.fn(),
    installMeter: jest.fn(),
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

  it('should throw EntityNotFoundException when meter does not exist', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(mockMeterRepository.installMeter).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException when meter is soft-deleted', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ deletedAt: new Date() }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(mockMeterRepository.installMeter).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException when meter is not in PENDIENTE state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.INSTALADO }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockMeterRepository.installMeter).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException when no active contract exists', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockMeterRepository.installMeter).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException when contract is not PENDIENTE_INSTALACION', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.ACTIVO,
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockMeterRepository.installMeter).not.toHaveBeenCalled();
  });

  it('should delegate the atomic install to the composite repository method', async () => {
    const installedMeter = makeMeter({
      estado: EstadoMedidor.INSTALADO,
      fechaInstalacion: new Date(),
    });

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: EstadoContrato.PENDIENTE_INSTALACION,
    });
    mockMeterRepository.installMeter.mockResolvedValue(installedMeter);

    const result = await useCase.execute(BigInt(1));

    expect(mockMeterRepository.installMeter).toHaveBeenCalledWith(
      expect.objectContaining({
        medidorId: BigInt(1),
        contratoId: BigInt(1),
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: expect.any(Date),
      }),
    );
    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
    expect(result.fechaInstalacion).toBeInstanceOf(Date);
  });
});
