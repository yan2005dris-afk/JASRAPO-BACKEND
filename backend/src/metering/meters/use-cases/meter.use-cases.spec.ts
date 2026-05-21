import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateMeterUseCase } from './create-meter.use-case';
import { FindOneMeterUseCase } from './find-one-meter.use-case';
import { InstallMeterUseCase } from './install-meter.use-case';
import { ReportDefectUseCase } from './report-defect.use-case';
import { DecommissionMeterUseCase } from './decommission-meter.use-case';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Meter Use Cases', () => {
  let createUseCase: CreateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;
  let installUseCase: InstallMeterUseCase;
  let reportDamageUseCase: ReportDefectUseCase;
  let decommissionUseCase: DecommissionMeterUseCase;
  let prisma: PrismaService;

  // Mock for findUnique
  const mockMedidorFromDb = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: 'BODEGA',
    deletedAt: null,
  };

  const mockPrismaService = {
    medidores: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historialMedidores: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMeterUseCase,
        FindOneMeterUseCase,
        InstallMeterUseCase,
        ReportDefectUseCase,
        DecommissionMeterUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    createUseCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
    installUseCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
    reportDamageUseCase = module.get<ReportDefectUseCase>(ReportDefectUseCase);
    decommissionUseCase = module.get<DecommissionMeterUseCase>(
      DecommissionMeterUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('CreateMeterUseCase', () => {
    it('should create a meter', async () => {
      mockPrismaService.medidores.create.mockResolvedValue(mockMedidorFromDb);
      const result = await createUseCase.execute({ serie: 'MED-001' } as any);
      expect(result).toHaveProperty('serie');
      expect(mockPrismaService.medidores.create).toHaveBeenCalled();
    });
  });

  describe('FindOneMeterUseCase', () => {
    it('should return a meter', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(
        mockMedidorFromDb,
      );
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toHaveProperty('serie');
      expect(result).toHaveProperty('estado');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('InstallMeterUseCase', () => {
    it('should install a meter', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(
        mockMedidorFromDb,
      );
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      const result = await installUseCase.execute(BigInt(1), BigInt(1));
      expect(result.estado).toBe('INSTALADO');
    });

    it('should throw BadRequestException if not in BODEGA', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      await expect(
        installUseCase.execute(BigInt(1), BigInt(1)),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('ReportDefectUseCase', () => {
    it('should report defect', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'DANADO',
      });
      const result = await reportDamageUseCase.execute(BigInt(1));
      expect(result.estado).toBe('DANADO');
    });

    it('should throw BadRequestException if not INSTALADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'BODEGA',
      });
      await expect(reportDamageUseCase.execute(BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('DecommissionMeterUseCase', () => {
    it('should decommission a meter', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'DANADO',
      });
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'BAJA',
      });
      const result = await decommissionUseCase.execute(BigInt(1), 'Broken');
      expect(result.estado).toBe('BAJA');
    });

    it('should throw BadRequestException if not DANADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      await expect(
        decommissionUseCase.execute(BigInt(1), 'Broken'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
