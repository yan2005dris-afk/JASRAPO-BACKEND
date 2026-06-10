import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterService } from './meter.service';
import { MeterRepository } from '../domain/repositories/meter.repository';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';

import { EstadoMedidor } from 'src/generated/prisma/enums';

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

  it('findAll should use repository and map response', async () => {
    const params = { skip: 0 };
    jest
      .spyOn(meterRepository, 'findMany')
      .mockResolvedValue([mockPrismaResult]);
    const result = await service.findAll(params);
    expect(result[0].medidorId).toEqual(expectedResponse.medidorId);
    expect(result[0].serie).toBe(expectedResponse.serie);
    expect(meterRepository.findMany).toHaveBeenCalled();
  });
});
