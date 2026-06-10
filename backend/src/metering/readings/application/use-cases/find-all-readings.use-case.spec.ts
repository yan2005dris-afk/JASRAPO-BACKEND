import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllReadingsUseCase } from './find-all-readings.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';

describe('FindAllReadingsUseCase', () => {
  let useCase: FindAllReadingsUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockReadings = [
    { lecturaId: BigInt(1), lecturaActual: 150, deletedAt: null },
    { lecturaId: BigInt(2), lecturaActual: 200, deletedAt: null },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReadingsUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    useCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all readings with pagination', async () => {
    mockReadingRepository.findMany.mockResolvedValue(mockReadings as any);
    mockReadingRepository.count.mockResolvedValue(2);

    const result = await useCase.execute();

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(mockReadingRepository.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      select: expect.any(Object),
      orderBy: { fecha: 'desc' },
    });
    expect(mockReadingRepository.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
  });

  it('should apply pagination', async () => {
    mockReadingRepository.findMany.mockResolvedValue([mockReadings[0]] as any);
    mockReadingRepository.count.mockResolvedValue(1);

    const result = await useCase.execute(1, 1);

    expect(result.data).toHaveLength(1);
    expect(mockReadingRepository.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 1,
      where: { deletedAt: null },
      select: expect.any(Object),
      orderBy: { fecha: 'desc' },
    });
  });

  it('should return empty paginated result when no readings', async () => {
    mockReadingRepository.findMany.mockResolvedValue([]);
    mockReadingRepository.count.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});
