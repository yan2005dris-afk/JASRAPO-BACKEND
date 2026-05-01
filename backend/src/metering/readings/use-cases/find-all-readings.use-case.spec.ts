import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllReadingsUseCase } from './find-all-readings.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllReadingsUseCase', () => {
  let useCase: FindAllReadingsUseCase;

  const mockPrismaService = {
    lecturas: {
      findMany: jest.fn(),
    },
  };

  const mockReadings = [
    { lecturaId: BigInt(1), lecturaActual: 150, deletedAt: null },
    { lecturaId: BigInt(2), lecturaActual: 200, deletedAt: null },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReadingsUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all readings', async () => {
    mockPrismaService.lecturas.findMany.mockResolvedValue(mockReadings as any);

    const result = await useCase.execute({});

    expect(result).toHaveLength(2);
  });

  it('should apply pagination', async () => {
    mockPrismaService.lecturas.findMany.mockResolvedValue([
      mockReadings[0],
    ] as any);

    const result = await useCase.execute({ skip: 0, take: 1 });

    expect(result).toHaveLength(1);
    expect(mockPrismaService.lecturas.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
      where: { deletedAt: null },
      orderBy: { fecha: 'desc' },
    });
  });

  it('should return empty array when no readings', async () => {
    mockPrismaService.lecturas.findMany.mockResolvedValue([]);

    const result = await useCase.execute({});

    expect(result).toEqual([]);
  });
});
