import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterRepository } from '../../domain/repositories/meter.repository';
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
  let meterRepository: MeterRepository;

  // Mock for findUnique
  const mockMedidorFromDb = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: 'BODEGA',
    deletedAt: null,
  };

  const mockMeterRepository = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    createHistory: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMeterUseCase,
        FindOneMeterUseCase,
        InstallMeterUseCase,
        ReportDefectUseCase,
        DecommissionMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    createUseCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
    installUseCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
    reportDamageUseCase = module.get<ReportDefectUseCase>(ReportDefectUseCase);
    decommissionUseCase = module.get<DecommissionMeterUseCase>(
      DecommissionMeterUseCase,
    );
    meterRepository = module.get<MeterRepository>(MeterRepository);
  });

  describe('CreateMeterUseCase', () => {
    it('should create a meter', async () => {
      mockMeterRepository.create.mockResolvedValue(mockMedidorFromDb);
      const result = await createUseCase.execute({ serie: 'MED-001' } as any);
      expect(result).toHaveProperty('serie');
      expect(mockMeterRepository.create).toHaveBeenCalled();
    });
  });

  describe('FindOneMeterUseCase', () => {
    it('should return a meter', async () => {
      mockMeterRepository.findUnique.mockResolvedValue(mockMedidorFromDb);
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toHaveProperty('serie');
      expect(result).toHaveProperty('estado');
    });

    it('should throw NotFoundException if not found', async () => {
      mockMeterRepository.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('InstallMeterUseCase', () => {
    it('should install a meter', async () => {
      mockMeterRepository.findUnique.mockResolvedValue(mockMedidorFromDb);
      mockMeterRepository.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      const result = await installUseCase.execute(BigInt(1), BigInt(1));
      expect(result.estado).toBe('INSTALADO');
    });

    it('should throw BadRequestException if not in BODEGA', async () => {
      mockMeterRepository.findUnique.mockResolvedValue({
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
      mockMeterRepository.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      mockMeterRepository.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'DANADO',
      });
      const result = await reportDamageUseCase.execute(BigInt(1));
      expect(result.estado).toBe('DANADO');
    });

    it('should throw BadRequestException if not INSTALADO', async () => {
      mockMeterRepository.findUnique.mockResolvedValue({
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
      mockMeterRepository.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'DANADO',
      });
      mockMeterRepository.update.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'BAJA',
      });
      const result = await decommissionUseCase.execute(BigInt(1), 'Broken');
      expect(result.estado).toBe('BAJA');
    });

    it('should throw BadRequestException if not DANADO', async () => {
      mockMeterRepository.findUnique.mockResolvedValue({
        ...mockMedidorFromDb,
        estado: 'INSTALADO',
      });
      await expect(
        decommissionUseCase.execute(BigInt(1), 'Broken'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
