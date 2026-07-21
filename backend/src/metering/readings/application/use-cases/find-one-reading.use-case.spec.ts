import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneReadingUseCase } from './find-one-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOneReadingUseCase', () => {
  let useCase: FindOneReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
  };

  const mockReading = {
    lecturaId: BigInt(1),
    lecturaActual: 150,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    useCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a reading by id', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(BigInt(1));

    expect(result.lecturaActual).toBe(150);
  });

  it('should throw NotFoundException when reading not found', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when reading is deleted', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });

  it('should return an active reading when repository resolves deletedAt as null (regression for soft-delete select)', async () => {
    const activeReading = {
      ...mockReading,
      deletedAt: null,
    };
    mockReadingRepository.findUnique.mockResolvedValue(activeReading as any);

    const result = await useCase.execute(BigInt(1));

    expect(result).toBe(activeReading);
    expect(result.deletedAt).toBeNull();
  });
});
