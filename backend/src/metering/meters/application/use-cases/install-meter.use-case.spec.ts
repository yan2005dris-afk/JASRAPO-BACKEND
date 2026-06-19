import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { InstallMeterUseCase } from './install-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    findActiveContractForMeter: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
  };

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: 'PENDIENTE',
    deletedAt: null,
  };

  const mockContratoPendienteInstalacion = {
    contratoId: BigInt(1),
    estado: 'PENDIENTE_INSTALACION',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should install meter from PENDIENTE when contract is PENDIENTE_INSTALACION', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(mockMedidor as any);
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue(
      mockContratoPendienteInstalacion,
    );
    mockMeterRepository.update.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
      fechaInstalacion: new Date(),
    } as any);

    const result = await useCase.execute(BigInt(1));

    expect(result.estado).toBe('INSTALADO');
    expect(mockMeterRepository.findActiveContractForMeter).toHaveBeenCalledWith(
      BigInt(1),
    );
    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      expect.objectContaining({
        estado: 'INSTALADO',
        fechaInstalacion: expect.any(Date),
      }),
      null,
    );
  });

  it('should throw BadRequestException when medidor is not in PENDIENTE', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'BODEGA',
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
    expect(
      mockMeterRepository.findActiveContractForMeter,
    ).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when medidor is already INSTALADO', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when medidor is BAJA', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'BAJA',
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when medidor is DANADO', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'DANADO',
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when medidor not found', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when medidor is deleted', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when meter has no active contract', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(mockMedidor as any);
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when contract is not PENDIENTE_INSTALACION', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(mockMedidor as any);
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: 'ACTIVO',
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when contract is SOLICITUD', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(mockMedidor as any);
    mockMeterRepository.findActiveContractForMeter.mockResolvedValue({
      contratoId: BigInt(1),
      estado: 'SOLICITUD',
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });
});
