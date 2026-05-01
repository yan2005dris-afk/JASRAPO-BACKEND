import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { InstallDeviceUseCase } from './install-device.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor } from 'src/generated/prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('InstallDeviceUseCase', () => {
  let useCase: InstallDeviceUseCase;

  const mockPrismaService = {
    medidores: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMedidor = {
    medidorId: BigInt(1),
    numeroSerie: 'MED-001',
    estado: EstadoMedidor.BODEGA,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallDeviceUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<InstallDeviceUseCase>(InstallDeviceUseCase);
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
      estado: EstadoMedidor.INSTALADO,
      contratoId: BigInt(123),
    } as any);

    const result = await useCase.execute(BigInt(1), BigInt(123));

    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
  });

  it('should install device from ESTIMADO status', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: EstadoMedidor.ESTIMADO,
    } as any);
    mockPrismaService.medidores.update.mockResolvedValue({
      ...mockMedidor,
      estado: EstadoMedidor.INSTALADO,
    } as any);

    const result = await useCase.execute(BigInt(1), BigInt(123));

    expect(result.estado).toBe(EstadoMedidor.INSTALADO);
  });

  it('should throw BadRequestException when medidor not found', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when medidor is deleted', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when medidor already installed', async () => {
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      ...mockMedidor,
      estado: EstadoMedidor.INSTALADO,
    } as any);

    await expect(useCase.execute(BigInt(1), BigInt(123))).rejects.toThrow(
      BadRequestException,
    );
  });
});
