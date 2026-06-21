import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetOperatorReadingsWithAnomaliesUseCase } from './get-operator-readings-with-anomalies.use-case';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

describe('GetOperatorReadingsWithAnomaliesUseCase', () => {
  let useCase: GetOperatorReadingsWithAnomaliesUseCase;

  const mockOperatorRepository = {
    findActivePeriod: jest.fn(),
    findReadingsWithPendingAnomalies: jest.fn(),
  };

  const mockActivePeriod = { periodoId: 5 };

  const mockReadings = [
    {
      lecturaId: BigInt(10),
      estado: 'CON_NOVEDAD',
      medidor: { serie: 'MED-001' },
      lecturaAnomalias: [
        { anomaliaId: BigInt(1), estado: 'PENDIENTE', tipo: 'FUGA' },
      ],
    },
    {
      lecturaId: BigInt(20),
      estado: 'CON_NOVEDAD',
      medidor: { serie: 'MED-002' },
      lecturaAnomalias: [
        { anomaliaId: BigInt(2), estado: 'PENDIENTE', tipo: 'LECTURA_ERRONEA' },
      ],
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOperatorReadingsWithAnomaliesUseCase,
        { provide: OperatorRepository, useValue: mockOperatorRepository },
      ],
    }).compile();

    useCase = module.get<GetOperatorReadingsWithAnomaliesUseCase>(
      GetOperatorReadingsWithAnomaliesUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when no active period exists', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(null);

    await expect(useCase.execute(42)).rejects.toThrow(NotFoundException);

    expect(mockOperatorRepository.findReadingsWithPendingAnomalies).not.toHaveBeenCalled();
  });

  it('should return readings with pending anomalies for the operator in the active period', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findReadingsWithPendingAnomalies.mockResolvedValue(mockReadings);

    const result = await useCase.execute(42);

    expect(mockOperatorRepository.findActivePeriod).toHaveBeenCalled();
    expect(mockOperatorRepository.findReadingsWithPendingAnomalies).toHaveBeenCalledWith(42, 5);
    expect(result).toBe(mockReadings);
    expect(result).toHaveLength(2);
    expect(result[0].estado).toBe('CON_NOVEDAD');
    expect(result[0].lecturaAnomalias[0].estado).toBe('PENDIENTE');
  });
});
