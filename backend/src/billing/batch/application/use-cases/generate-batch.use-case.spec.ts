import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GenerateBatchUseCase } from './generate-batch.use-case';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('GenerateBatchUseCase', () => {
  let useCase: GenerateBatchUseCase;

  const mockRepository = {
    paginate: jest.fn(),
    findById: jest.fn(),
    count: jest.fn(),
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        GenerateBatchUseCase,
        { provide: BatchRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GenerateBatchUseCase>(GenerateBatchUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should generate batch and return result', async () => {
    mockRepository.generate.mockResolvedValue(BigInt(42));

    const result = await useCase.execute({
      periodoId: 1,
      comunidadId: 2,
      creadoPor: 'admin',
    });

    expect(result.batchId).toBe(42);
    expect(result.message).toBe('Batch generated successfully');
    expect(mockRepository.generate).toHaveBeenCalledWith({
      periodoId: 1,
      comunidadId: 2,
      creadoPor: 'admin',
    });
  });
});
