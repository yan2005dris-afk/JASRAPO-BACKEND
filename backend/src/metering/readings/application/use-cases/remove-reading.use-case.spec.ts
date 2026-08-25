import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('RemoveReadingUseCase', () => {
  let useCase: RemoveReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
    isReadingLinkedToReplacement: jest.fn().mockResolvedValue(false),
  };

  const mockReading = {
    lecturaId: BigInt(1),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    useCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a reading', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.update.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    const result = await useCase.execute(BigInt(1));

    expect(result.message).toContain('eliminada');
    expect(mockReadingRepository.update).toHaveBeenCalledWith(
      { lecturaId: BigInt(1) },
      { deletedAt: expect.any(Date) },
    );
  });

  it('should throw EntityNotFoundException when reading not found', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityNotFoundException when reading is already deleted', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException when reading is linked to a replacement', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.isReadingLinkedToReplacement.mockResolvedValue(true);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });
});
