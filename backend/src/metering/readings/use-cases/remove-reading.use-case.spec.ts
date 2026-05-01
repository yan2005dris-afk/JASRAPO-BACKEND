import { Test, TestingModule } from '@nestjs/testing';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveReadingUseCase', () => {
  let useCase: RemoveReadingUseCase;

  const mockPrismaService = {
    lecturas: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockReading = {
    lecturaId: BigInt(1),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveReadingUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a reading', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(mockReading as any);
    mockPrismaService.lecturas.update.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    const result = await useCase.execute(BigInt(1));

    expect(result.message).toContain('eliminada');
    expect(mockPrismaService.lecturas.update).toHaveBeenCalledWith({
      where: { lecturaId: BigInt(1) },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw NotFoundException when reading not found', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999)))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when reading is already deleted', async () => {
    mockPrismaService.lecturas.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(BigInt(1)))
      .rejects.toThrow(NotFoundException);
  });
});