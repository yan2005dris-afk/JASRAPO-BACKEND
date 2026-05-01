import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UpdateReadingUseCase', () => {
  let useCase: UpdateReadingUseCase;

  const mockPrismaService = {
    lecturas: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
        UpdateReadingUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a reading', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(mockReading as any);
    mockPrismaService.lecturas.update.mockResolvedValue({
      ...mockReading,
      lecturaActual: 200,
    } as any);

    const result = await useCase.execute(BigInt(1), { lecturaActual: 200 });

    expect(result.lecturaActual).toBe(200);
  });

  it('should throw NotFoundException when reading not found', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999), { lecturaActual: 200 }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when reading is deleted', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1), { lecturaActual: 200 }))
      .rejects.toThrow(NotFoundException);
  });
});