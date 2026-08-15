import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneReadingAnomalyUseCase } from './find-one-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneReadingAnomalyUseCase', () => {
  let useCase: FindOneReadingAnomalyUseCase;

  const mockReadingAnomalyRepository = {
    findUnique: jest.fn(),
  };

  const mockAnomaly = new ReadingAnomalyEntity({
    anomaliaId: BigInt(1),
    lecturaId: BigInt(42),
    observacion: 'Fuga de agua en el medidor',
    tipo: 'FUGA',
    estado: 'PENDIENTE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    fotoUrl: null,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneReadingAnomalyUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneReadingAnomalyUseCase>(
      FindOneReadingAnomalyUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return the anomaly when found', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(mockAnomaly);

    const result = await useCase.execute(BigInt(1));

    expect(result).toBe(mockAnomaly);
    expect(result.deletedAt).toBeNull();
    expect(mockReadingAnomalyRepository.findUnique).toHaveBeenCalledWith({
      anomaliaId: BigInt(1),
    });
  });

  it('should throw EntityNotFoundException when anomaly not found', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityNotFoundException when anomaly is soft-deleted', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should pass a negative id to findUnique without validation (documented current behavior)', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(-1))).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockReadingAnomalyRepository.findUnique).toHaveBeenCalledWith({
      anomaliaId: BigInt(-1),
    });
  });

  it('should pass a zero id to findUnique without validation (documented current behavior)', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(0))).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockReadingAnomalyRepository.findUnique).toHaveBeenCalledWith({
      anomaliaId: BigInt(0),
    });
  });
});