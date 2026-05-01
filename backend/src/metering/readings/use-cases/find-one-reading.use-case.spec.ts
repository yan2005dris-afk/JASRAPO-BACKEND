import { Test, TestingModule } from '@nestjs/testing';
import { FindOneReadingUseCase } from './find-one-reading.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FindOneReadingUseCase', () => {
  let useCase: FindOneReadingUseCase;

  const mockPrismaService = {
    lecturas: {
      findUnique: jest.fn(),
    },
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
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a reading by id', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(BigInt(1));

    expect(result.lecturaActual).toBe(150);
  });

  it('should throw NotFoundException when reading not found', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999)))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when reading is deleted', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1)))
      .rejects.toThrow(NotFoundException);
  });
});