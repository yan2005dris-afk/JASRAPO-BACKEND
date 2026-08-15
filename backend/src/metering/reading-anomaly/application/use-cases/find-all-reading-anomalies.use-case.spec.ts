import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllReadingAnomaliesUseCase } from './find-all-reading-anomalies.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

describe('FindAllReadingAnomaliesUseCase', () => {
  let useCase: FindAllReadingAnomaliesUseCase;

  const mockReadingAnomalyRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createAndMarkReadingWithAnomaly: jest.fn(),
    update: jest.fn(),
  };

  const mockAnomalies = [
    new ReadingAnomalyEntity({
      anomaliaId: BigInt(1),
      lecturaId: BigInt(42),
      observacion: 'Fuga de agua en el medidor',
      tipo: 'FUGA',
      estado: 'PENDIENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fotoUrl: null,
    }),
    new ReadingAnomalyEntity({
      anomaliaId: BigInt(2),
      lecturaId: BigInt(7),
      observacion: 'Medidor dañado',
      tipo: 'MEDIDOR_DAÑADO',
      estado: 'PENDIENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fotoUrl: null,
    }),
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReadingAnomaliesUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllReadingAnomaliesUseCase>(
      FindAllReadingAnomaliesUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all anomalies with full pagination meta', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue(
      mockAnomalies as any,
    );
    mockReadingAnomalyRepository.count.mockResolvedValue(2);

    const result = await useCase.execute();

    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      ultimaPagina: 1,
      paginaActual: 1,
      porPagina: 10,
      anterior: null,
      siguiente: null,
    });
    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 10,
    });
    expect(mockReadingAnomalyRepository.count).toHaveBeenCalledWith({
      where: undefined,
    });
  });

  it('should apply pagination', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue([
      mockAnomalies[0],
    ] as any);
    mockReadingAnomalyRepository.count.mockResolvedValue(2);

    await useCase.execute(2, 5);

    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 5,
      take: 5,
    });
    expect(mockReadingAnomalyRepository.count).toHaveBeenCalledWith({
      where: undefined,
    });
  });

  it('should return empty paginated result when no anomalies', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue([]);
    mockReadingAnomalyRepository.count.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      ultimaPagina: 0,
      paginaActual: 1,
      porPagina: 10,
      anterior: null,
      siguiente: null,
    });
  });

  it('should forward filters to findMany and count', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue([
      mockAnomalies[0],
    ] as any);
    mockReadingAnomalyRepository.count.mockResolvedValue(1);

    await useCase.execute(1, 10, {
      tipo: 'FUGA',
      estado: 'PENDIENTE',
      lecturaId: BigInt(42),
    });

    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: { tipo: 'FUGA', estado: 'PENDIENTE', lecturaId: BigInt(42) },
      skip: 0,
      take: 10,
    });
    expect(mockReadingAnomalyRepository.count).toHaveBeenCalledWith({
      where: { tipo: 'FUGA', estado: 'PENDIENTE', lecturaId: BigInt(42) },
    });
  });

  it('should clamp a negative page to 1 (getPagination behavior)', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue(
      mockAnomalies as any,
    );
    mockReadingAnomalyRepository.count.mockResolvedValue(2);

    const result = await useCase.execute(-1, 10);

    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 10,
    });
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      ultimaPagina: 1,
      paginaActual: 1,
      porPagina: 10,
      anterior: null,
      siguiente: null,
    });
  });

  it('should clamp a zero limit to take 1 (getPagination lower clamp)', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue(
      mockAnomalies as any,
    );
    mockReadingAnomalyRepository.count.mockResolvedValue(2);

    const result = await useCase.execute(1, 0);

    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 1,
    });
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 1,
      ultimaPagina: 2,
      paginaActual: 1,
      porPagina: 1,
      anterior: null,
      siguiente: 2,
    });
  });

  it('should clamp a negative limit to take 1 (getPagination lower clamp)', async () => {
    mockReadingAnomalyRepository.findMany.mockResolvedValue(
      mockAnomalies as any,
    );
    mockReadingAnomalyRepository.count.mockResolvedValue(2);

    const result = await useCase.execute(1, -5);

    expect(mockReadingAnomalyRepository.findMany).toHaveBeenCalledWith({
      where: undefined,
      skip: 0,
      take: 1,
    });
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 1,
      ultimaPagina: 2,
      paginaActual: 1,
      porPagina: 1,
      anterior: null,
      siguiente: 2,
    });
  });
});
