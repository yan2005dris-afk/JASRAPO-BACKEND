import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BatchService } from './batch.service';
import { GenerateBatchUseCase } from './use-cases/generate-batch.use-case';
import { FindAllBatchesUseCase } from './use-cases/find-all-batches.use-case';
import { FindOneBatchUseCase } from './use-cases/find-one-batch.use-case';
import { BatchRepository } from '../domain/repositories/batch.repository';
import { BatchEntity } from '../domain/entities/batch.entity';

describe('BatchService', () => {
  let service: BatchService;

  const mockBatch = new BatchEntity({
    loteId: BigInt(1),
    comunidadId: 1,
    periodoId: 1,
    estado: 'BORRADOR',
    totalMonto: 100,
    notas: null,
    creadoPor: 'admin',
    totalEmisiones: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockGenerateUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: GenerateBatchUseCase, useValue: mockGenerateUseCase },
        { provide: FindAllBatchesUseCase, useValue: mockFindAllUseCase },
        { provide: FindOneBatchUseCase, useValue: mockFindOneUseCase },
        { provide: BatchRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate generate to generateUseCase', async () => {
    mockGenerateUseCase.execute.mockResolvedValue({
      message: 'ok',
      batchId: 1,
    });

    const result = await service.generate({ periodoId: 1 });

    expect(result).toEqual({ message: 'ok', batchId: 1 });
    expect(mockGenerateUseCase.execute).toHaveBeenCalledWith({
      periodoId: 1,
      comunidadId: null,
      creadoPor: 'SYSTEM',
    });
  });

  it('should delegate findAll to findAllUseCase', async () => {
    mockFindAllUseCase.execute.mockResolvedValue({
      data: [mockBatch],
      meta: {},
    });

    const result = await service.findAll(1, 10);

    expect(result.data).toHaveLength(1);
    expect(mockFindAllUseCase.execute).toHaveBeenCalledWith(1, 10, undefined);
  });

  it('should delegate findOne to findOneUseCase', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(mockBatch);

    const result = await service.findOne(1);

    expect(result.loteId).toBe(BigInt(1));
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should return all states', async () => {
    const states = await service.findAllStates();
    expect(states).toBeDefined();
    expect(Array.isArray(states)).toBe(true);
  });
});
