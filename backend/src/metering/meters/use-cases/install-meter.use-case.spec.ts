import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { InstallMeterUseCase } from './install-meter.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('InstallMeterUseCase', () => {
  let useCase: InstallMeterUseCase;

  const mockPrismaService = {
    medidores: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historialMedidores: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
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
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should install device from BODEGA status and create history', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue(
      mockMedidor as any,
    );
    mockPrismaService.medidores.update.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    } as any);
    mockPrismaService.historialMedidores.create.mockResolvedValue({});

    const result = await useCase.execute(BigInt(1), BigInt(123));

    expect(result.estado).toBe('INSTALADO');
    expect(mockPrismaService.historialMedidores.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        medidorId: BigInt(1),
        contratoId: BigInt(123),
        lecturaInicial: 0,
      }),
    });
  });

  it('should throw BadRequestException when medidor is not in BODEGA status', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    });

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when medidor not found', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999), BigInt(123))).rejects.toThrow(
      'Medidor no encontrado',
    );
  });

  it('should throw NotFoundException when medidor is deleted', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      'Medidor no encontrado',
    );
  });

  it('should throw BadRequestException when medidor already installed', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: 'INSTALADO',
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });
});
