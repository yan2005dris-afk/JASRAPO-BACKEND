import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterUseCase } from './create-meter.use-case';
import { FindOneMeterUseCase } from './find-one-meter.use-case';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('Meter Use Cases', () => {
  let createUseCase: CreateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;
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
    findActiveContractForMeter: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    createHistory: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        CreateMeterUseCase,
        FindOneMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    createUseCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
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
});
