import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveReadingAnomalyUseCase } from './remove-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('RemoveReadingAnomalyUseCase', () => {
  let useCase: RemoveReadingAnomalyUseCase;
  const mockStorageService = { delete: jest.fn() };
  const mockLogger = { error: jest.fn() };
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
        { provide: StorageService, useValue: mockStorageService },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();
    useCase = module.get(RemoveReadingAnomalyUseCase);
  });

  it('should be defined', () => expect(useCase).toBeDefined());

  it('soft deletes and removes persisted evidence after the DB update', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      fotoUrl: 'reading-news/evidence.webp',
    });
    mockReadingAnomalyRepository.update.mockImplementation(async () => {
      expect(mockStorageService.delete).not.toHaveBeenCalled();
      return { ...mockAnomaly, deletedAt: new Date() };
    });
    mockStorageService.delete.mockResolvedValue(undefined);

    await expect(useCase.execute(BigInt(1))).resolves.toEqual({
      message: 'Anomalía eliminada correctamente',
    });
    expect(mockStorageService.delete).toHaveBeenCalledWith(
      'reading-news',
      'reading-news/evidence.webp',
    );
  });

  it('does not fail the soft delete when evidence cleanup fails', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      fotoUrl: 'reading-news/evidence.webp',
    });
    mockReadingAnomalyRepository.update.mockResolvedValue(mockAnomaly);
    mockStorageService.delete.mockRejectedValue(
      new Error('storage unavailable'),
    );
    await expect(useCase.execute(BigInt(1))).resolves.toEqual({
      message: 'Anomalía eliminada correctamente',
    });
  });

  it('throws when anomaly is missing or already deleted', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      deletedAt: new Date(),
    });
    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(mockReadingAnomalyRepository.update).not.toHaveBeenCalled();
  });
});
