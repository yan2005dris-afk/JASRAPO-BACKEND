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
  };

  // FK pattern: estadoId instead of enum
  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estadoId: BigInt(1), // BODEGA
    estado: { codigo: 'BODEGA', nombre: 'En Bodega' },
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

  it('should install device from BODEGA status', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue(
      mockMedidor as any,
    );
    mockPrismaService.medidores.update.mockResolvedValue({
      ...mockMedidor,
      estadoId: BigInt(2), // INSTALADO
      estado: { codigo: 'INSTALADO', nombre: 'Instalado' },
      contratoId: BigInt(123),
    } as any);

    const result = await useCase.execute(BigInt(1), BigInt(123));

    expect(result.estado).toBe('INSTALADO');
  });

  it('should throw BadRequestException when medidor is not in BODEGA status', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      estadoId: BigInt(2), // INSTALADO
      estado: { codigo: 'INSTALADO', nombre: 'Instalado' },
    } as any);

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
      estadoId: BigInt(2),
      estado: { codigo: 'INSTALADO', nombre: 'Instalado' },
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });
});
