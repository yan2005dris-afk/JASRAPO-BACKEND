import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllMetersUseCase } from './find-all-meters.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';

describe('FindAllMetersUseCase', () => {
  let useCase: FindAllMetersUseCase;

  const mockMedidorFromDb = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'CX1000',
    marca: 'Itron',
    estado: EstadoMedidor.BODEGA,
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMeterRepository = {
    findMany: jest.fn(),
    count: jest.fn(),
    groupByEstado: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllMetersUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<FindAllMetersUseCase>(FindAllMetersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated response with kpis', async () => {
    mockMeterRepository.findMany.mockResolvedValue([mockMedidorFromDb]);
    mockMeterRepository.count.mockResolvedValue(1);
    mockMeterRepository.groupByEstado.mockResolvedValue([
      { estado: EstadoMedidor.BODEGA, _count: { _all: 1 } },
    ]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].serie).toBe('MED-001');
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.kpis.enBodega).toBe(1);
    expect(result.kpis.instalados).toBe(0);
    expect(result.kpis.danados).toBe(0);
    expect(result.kpis.total).toBe(1);
    expect(mockMeterRepository.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
    });
    expect(mockMeterRepository.count).toHaveBeenCalledTimes(1);
    expect(mockMeterRepository.groupByEstado).toHaveBeenCalledTimes(1);
  });

  it('should fall back to default pagination when filters are undefined or empty', async () => {
    mockMeterRepository.findMany.mockResolvedValue([mockMedidorFromDb]);
    mockMeterRepository.count.mockResolvedValue(1);
    mockMeterRepository.groupByEstado.mockResolvedValue([]);

    const resultUndefined = await useCase.execute();
    expect(resultUndefined.meta.page).toBe(1);
    expect(resultUndefined.meta.limit).toBe(10);
    expect(mockMeterRepository.findMany).toHaveBeenLastCalledWith({
      where: undefined,
      skip: 0,
      take: 10,
    });

    const resultEmpty = await useCase.execute({});
    expect(resultEmpty.meta.page).toBe(1);
    expect(resultEmpty.meta.limit).toBe(10);
    expect(mockMeterRepository.findMany).toHaveBeenLastCalledWith({
      where: {},
      skip: 0,
      take: 10,
    });
  });

  it('should build filters and pass them to the repository', async () => {
    mockMeterRepository.findMany.mockResolvedValue([]);
    mockMeterRepository.count.mockResolvedValue(0);
    mockMeterRepository.groupByEstado.mockResolvedValue([]);

    await useCase.execute({
      page: 2,
      limit: 5,
      estado: EstadoMedidor.INSTALADO,
      marca: 'Itron',
    });

    expect(mockMeterRepository.findMany).toHaveBeenCalledWith({
      where: { estado: EstadoMedidor.INSTALADO, marca: 'Itron' },
      skip: 5,
      take: 5,
    });
    expect(mockMeterRepository.count).toHaveBeenCalledWith({
      estado: EstadoMedidor.INSTALADO,
      marca: 'Itron',
    });
    expect(mockMeterRepository.groupByEstado).toHaveBeenCalledWith({
      estado: EstadoMedidor.INSTALADO,
      marca: 'Itron',
    });
  });

  it('should ignore unknown estados in named kpis but include them in meta.total', async () => {
    mockMeterRepository.findMany.mockResolvedValue([mockMedidorFromDb]);
    mockMeterRepository.count.mockResolvedValue(7);
    mockMeterRepository.groupByEstado.mockResolvedValue([
      { estado: EstadoMedidor.BODEGA, _count: { _all: 2 } },
      { estado: EstadoMedidor.INSTALADO, _count: { _all: 3 } },
      { estado: EstadoMedidor.DANADO, _count: { _all: 1 } },
      { estado: EstadoMedidor.BAJA, _count: { _all: 1 } },
    ]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.meta.total).toBe(7);
    expect(result.kpis.enBodega).toBe(2);
    expect(result.kpis.instalados).toBe(3);
    expect(result.kpis.danados).toBe(1);
    expect(result.kpis.total).toBe(7);
  });
});
