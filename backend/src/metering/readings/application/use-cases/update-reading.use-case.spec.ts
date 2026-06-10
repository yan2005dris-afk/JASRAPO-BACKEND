import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateReadingUseCase', () => {
  let useCase: UpdateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockReading = {
    lecturaId: BigInt(1),
    lecturaActual: 150,
    deletedAt: null,
  };

  const mockUpdatedReading = {
    lecturaId: BigInt(1),
    lecturaActual: 200,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    useCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a reading', async () => {
    mockReadingRepository.findUnique
      .mockResolvedValueOnce(mockReading as any) // first call: existence check
      .mockResolvedValueOnce(mockUpdatedReading as any); // second call: after update with select
    mockReadingRepository.update.mockResolvedValue(mockUpdatedReading as any);

    const result = await useCase.execute(BigInt(1), { lecturaActual: 200 });

    expect(result.lecturaActual).toBe(200);
    expect(mockReadingRepository.update).toHaveBeenCalledWith(
      { lecturaId: BigInt(1) },
      expect.objectContaining({ lecturaActual: 200 }),
    );
  });

  it('should throw NotFoundException when reading not found', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(BigInt(999), { lecturaActual: 200 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when reading is deleted', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(
      useCase.execute(BigInt(1), { lecturaActual: 200 }),
    ).rejects.toThrow(NotFoundException);
  });
});
