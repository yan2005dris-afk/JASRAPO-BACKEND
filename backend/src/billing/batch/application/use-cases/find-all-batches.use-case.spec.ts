import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllBatchesUseCase } from './find-all-batches.use-case';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { batchRow } from '../../__test-utils__/batch-row.factory';

describe('FindAllBatchesUseCase', () => {
  let useCase: FindAllBatchesUseCase;

  const mockBatch = batchRow({
    loteId: BigInt(1),
    comunidadId: 1,
    periodoId: 1,
    estado: 'BORRADOR',
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
        FindAllBatchesUseCase,
        { provide: BatchRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllBatchesUseCase>(FindAllBatchesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated batches', async () => {
    mockRepository.paginate.mockResolvedValue({
      data: [mockBatch],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await useCase.execute(1, 10, { estado: 'BORRADOR' });

    expect(result.data).toHaveLength(1);
    expect(mockRepository.paginate).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { estado: 'BORRADOR' },
    );
  });
});
