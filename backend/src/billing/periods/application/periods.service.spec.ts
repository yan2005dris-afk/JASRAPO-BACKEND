import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PeriodsService } from './periods.service';
import { CreatePeriodUseCase } from './use-cases/create-period.use-case';
import { FindAllPeriodsUseCase } from './use-cases/find-all-periods.use-case';
import { FindOnePeriodUseCase } from './use-cases/find-one-period.use-case';
import { UpdatePeriodUseCase } from './use-cases/update-period.use-case';
import { DeletePeriodUseCase } from './use-cases/delete-period.use-case';
import { GenerateAnnualPeriodsUseCase } from './use-cases/generate-annual-periods.use-case';
import { PeriodEntity } from '../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

describe('PeriodsService', () => {
  let service: PeriodsService;

  const mockCreatePeriodUseCase = { execute: jest.fn() };
  const mockFindAllPeriodsUseCase = { execute: jest.fn() };
  const mockFindOnePeriodUseCase = { execute: jest.fn() };
  const mockUpdatePeriodUseCase = { execute: jest.fn() };
  const mockDeletePeriodUseCase = { execute: jest.fn() };
  const mockGenerateAnnualPeriodsUseCase = { execute: jest.fn() };

  const samplePeriod = new PeriodEntity({
    periodoId: 1,
    nombre: '2026-01',
    fechaInicio: new Date('2026-01-01'),
    fechaFin: new Date('2026-01-31'),
    fechaVencimiento: new Date('2026-02-15'),
    estado: EstadoPeriodo.ABIERTO,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodsService,
        {
          provide: CreatePeriodUseCase,
          useValue: mockCreatePeriodUseCase,
        },
        {
          provide: GenerateAnnualPeriodsUseCase,
          useValue: mockGenerateAnnualPeriodsUseCase,
        },
        {
          provide: FindAllPeriodsUseCase,
          useValue: mockFindAllPeriodsUseCase,
        },
        {
          provide: FindOnePeriodUseCase,
          useValue: mockFindOnePeriodUseCase,
        },
        {
          provide: UpdatePeriodUseCase,
          useValue: mockUpdatePeriodUseCase,
        },
        {
          provide: DeletePeriodUseCase,
          useValue: mockDeletePeriodUseCase,
        },
      ],
    }).compile();

    service = module.get<PeriodsService>(PeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call create use case', async () => {
    mockCreatePeriodUseCase.execute.mockResolvedValue(samplePeriod);
    const result = await service.create({
      nombre: '2026-01',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      fechaVencimiento: '2026-02-15',
    });
    expect(result).toBe(samplePeriod);
    expect(mockCreatePeriodUseCase.execute).toHaveBeenCalled();
  });

  it('should call findOne use case', async () => {
    mockFindOnePeriodUseCase.execute.mockResolvedValue(samplePeriod);
    const result = await service.findOne(1);
    expect(result).toBe(samplePeriod);
    expect(mockFindOnePeriodUseCase.execute).toHaveBeenCalledWith(1);
  });
});
