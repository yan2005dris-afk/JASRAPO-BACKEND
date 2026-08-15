import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveReadingAnomalyUseCase } from './remove-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('RemoveReadingAnomalyUseCase', () => {
  let useCase: RemoveReadingAnomalyUseCase;

  const mockReadingAnomalyRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
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
        RemoveReadingAnomalyUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemoveReadingAnomalyUseCase>(
      RemoveReadingAnomalyUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete an anomaly', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(mockAnomaly);
    mockReadingAnomalyRepository.update.mockResolvedValue({
      ...mockAnomaly,
      deletedAt: new Date(),
    } as any);

    const result = await useCase.execute(BigInt(1));

    expect(result).toEqual({ message: 'Anomalía eliminada correctamente' });
    expect(mockReadingAnomalyRepository.update).toHaveBeenCalledWith(
      { anomaliaId: BigInt(1) },
      { deletedAt: expect.any(Date) },
    );
  });

  it('should throw EntityNotFoundException when anomaly not found', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityNotFoundException when anomaly is already deleted', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should not call update when anomaly is missing', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );

    expect(mockReadingAnomalyRepository.update).not.toHaveBeenCalled();
  });
});