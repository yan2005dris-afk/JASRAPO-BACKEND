import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterService } from './meter.service';
import { MeterRepository } from '../domain/repositories/meter.repository';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';

import { EstadoMedidor } from 'src/metering/meters/domain/enums/estado-medidor.enum';

describe('MeterService', () => {
  let service: MeterService;
  let meterRepository: MeterRepository;
  let createUseCase: CreateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;
  let installUseCase: InstallMeterUseCase;
  let reportDamageUseCase: ReportDefectUseCase;
  let decommissionUseCase: DecommissionMeterUseCase;

  // Prisma result (raw DB)
  const mockPrismaResult = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'CX1000',
    marca: 'Itron',
    estado: EstadoMedidor.BODEGA,
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    latitud: null,
    longitud: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // DTO shape (what the service returns after mapping)
  const expectedResponse = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'CX1000',
    marca: 'Itron',
    estado: 'BODEGA',
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    latitud: null,
    longitud: null,
  };

  const mockMeterRepository = {
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeterService,
        {
          provide: MeterRepository,
          useValue: mockMeterRepository,
        },
        { provide: CreateMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: InstallMeterUseCase, useValue: { execute: jest.fn() } },
        {
          provide: ReportDefectUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DecommissionMeterUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MeterService>(MeterService);
    meterRepository = module.get<MeterRepository>(MeterRepository);
    createUseCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
    installUseCase = module.get<InstallMeterUseCase>(InstallMeterUseCase);
    reportDamageUseCase = module.get<ReportDefectUseCase>(ReportDefectUseCase);
    decommissionUseCase = module.get<DecommissionMeterUseCase>(
      DecommissionMeterUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateMeterUseCase and map response', async () => {
    const dto = { serie: 'MED-001' } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockPrismaResult);
    const result = await service.create(dto);
    expect(result.medidorId).toEqual(expectedResponse.medidorId);
    expect(result.serie).toBe(expectedResponse.serie);
    expect(result.marca).toBe(expectedResponse.marca);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findOne should delegate to FindOneMeterUseCase and map response', async () => {
    const id = BigInt(1);
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockPrismaResult);
    const result = await service.findOne(id);
    expect(result.medidorId).toEqual(expectedResponse.medidorId);
    expect(result.serie).toBe(expectedResponse.serie);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('findAll should return paginated response with kpis', async () => {
    jest
      .spyOn(meterRepository, 'findMany')
      .mockResolvedValue([mockPrismaResult]);
    jest.spyOn(meterRepository, 'count').mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.kpis.enBodega).toBe(1);
    expect(meterRepository.findMany).toHaveBeenCalled();
    expect(meterRepository.count).toHaveBeenCalled();
  });

  it('findAll should fall back to default pagination when filters are empty or undefined', async () => {
    jest
      .spyOn(meterRepository, 'findMany')
      .mockResolvedValue([mockPrismaResult]);
    jest.spyOn(meterRepository, 'count').mockResolvedValue(1);

    // Case 1: Undefined filters
    const resultUndefined = await service.findAll();
    expect(resultUndefined.meta.page).toBe(1);
    expect(resultUndefined.meta.limit).toBe(10);
    expect(meterRepository.findMany).toHaveBeenLastCalledWith({
      where: undefined,
      skip: 0,
      take: 10,
    });

    // Case 2: Empty filters ({})
    const resultEmpty = await service.findAll({});
    expect(resultEmpty.meta.page).toBe(1);
    expect(resultEmpty.meta.limit).toBe(10);
    expect(meterRepository.findMany).toHaveBeenLastCalledWith({
      where: {},
      skip: 0,
      take: 10,
    });

    // Case 3: Null filters
    const resultNull = await service.findAll(null as any);
    expect(resultNull.meta.page).toBe(1);
    expect(resultNull.meta.limit).toBe(10);
    expect(meterRepository.findMany).toHaveBeenLastCalledWith({
      where: undefined,
      skip: 0,
      take: 10,
    });
  });
});
