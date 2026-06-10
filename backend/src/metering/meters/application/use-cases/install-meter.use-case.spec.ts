import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { InstallMeterUseCase } from './install-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { BadRequestException } from '@nestjs/common';

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
    createHistory: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
  };

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: 'BODEGA',
    deletedAt: null,
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

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should install device from BODEGA status and create history', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      mockMedidor as any,
    );
    mockMeterRepository.update.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    } as any);
    mockMeterRepository.createHistory.mockResolvedValue({});

    const result = await useCase.execute(BigInt(1), BigInt(123));

    expect(result.estado).toBe('INSTALADO');
    expect(mockMeterRepository.createHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        medidor: expect.objectContaining({ connect: { medidorId: BigInt(1) } }),
        contrato: expect.objectContaining({ connect: { contratoId: BigInt(123) } }),
        lecturaInicial: 0,
      }),
      null,
    );
  });

  it('should throw BadRequestException when medidor is not in BODEGA status', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    });

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when medidor not found', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999), BigInt(123))).rejects.toThrow(
      'Medidor no encontrado',
    );
  });

  it('should throw NotFoundException when medidor is deleted', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      'Medidor no encontrado',
    );
  });

  it('should throw BadRequestException when medidor already installed', async () => {
    mockMeterRepository.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });
});
