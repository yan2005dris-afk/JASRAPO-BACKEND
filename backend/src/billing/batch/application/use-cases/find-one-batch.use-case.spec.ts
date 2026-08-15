import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneBatchUseCase } from './find-one-batch.use-case';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchEntity } from '../../domain/entities/batch.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneBatchUseCase', () => {
  let useCase: FindOneBatchUseCase;

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

  const mockRepository = {
    paginate: jest.fn(),
    findById: jest.fn(),
    count: jest.fn(),
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneBatchUseCase,
        { provide: BatchRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindOneBatchUseCase>(FindOneBatchUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return batch when found', async () => {
    mockRepository.findById.mockResolvedValue(mockBatch);

    const result = await useCase.execute(1);

    expect(result.loteId).toBe(BigInt(1));
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
