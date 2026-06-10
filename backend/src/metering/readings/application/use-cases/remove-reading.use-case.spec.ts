import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { NotFoundException } from '@nestjs/common';

describe('RemoveReadingUseCase', () => {
  let useCase: RemoveReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
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

  it('should throw NotFoundException when reading not found', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when reading is already deleted', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });
});
