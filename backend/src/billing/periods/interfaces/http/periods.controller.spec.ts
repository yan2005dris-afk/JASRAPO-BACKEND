import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from '../../application/periods.service';
import { periodRow } from '../../__test-utils__/period-row.factory';
import { EstadoPeriodo } from 'src/shared/enums';
import { CreatePeriodUseCase } from '../../application/use-cases/create-period.use-case';
import { FindAllPeriodsUseCase } from '../../application/use-cases/find-all-periods.use-case';
import { FindOnePeriodUseCase } from '../../application/use-cases/find-one-period.use-case';
import { UpdatePeriodUseCase } from '../../application/use-cases/update-period.use-case';
import { DeletePeriodUseCase } from '../../application/use-cases/delete-period.use-case';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';

describe('PeriodsController', () => {
  let controller: PeriodsController;

  const mockPeriodsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const samplePeriod = periodRow({
    periodoId: 1,
    nombre: '2026-01',
    fechaInicio: new Date('2026-01-01'),
    fechaFin: new Date('2026-01-31'),
    fechaVencimiento: new Date('2026-02-15'),
    estado: EstadoPeriodo.ABIERTO,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodsController],
      providers: [
        { provide: PeriodsService, useValue: mockPeriodsService },
        { provide: CreatePeriodUseCase, useValue: {} },
        { provide: FindAllPeriodsUseCase, useValue: {} },
        { provide: FindOnePeriodUseCase, useValue: {} },
        { provide: UpdatePeriodUseCase, useValue: {} },
        { provide: DeletePeriodUseCase, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PeriodsController>(PeriodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a period', async () => {
    mockPeriodsService.create.mockResolvedValue(samplePeriod);
    const result = await controller.create({
      nombre: '2026-01',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      fechaVencimiento: '2026-02-15',
    });
    expect(result.periodoId).toBe(1);
    expect(result.nombre).toBe('2026-01');
  });

  it('should find all periods', async () => {
    mockPeriodsService.findAll.mockResolvedValue({
      data: [samplePeriod],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    });

    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should find one period by id', async () => {
    mockPeriodsService.findOne.mockResolvedValue(samplePeriod);
    const result = await controller.findOne(1);
    expect(result.periodoId).toBe(1);
  });

  it('should update a period', async () => {
    mockPeriodsService.update.mockResolvedValue(
      periodRow({
        ...samplePeriod,
        estado: EstadoPeriodo.CERRADO,
      }),
    );
    const result = await controller.update(1, {
      estado: EstadoPeriodo.CERRADO,
    });
    expect(result.estado).toBe(EstadoPeriodo.CERRADO);
  });

  it('should delete a period', async () => {
    mockPeriodsService.delete.mockResolvedValue(samplePeriod);
    const result = await controller.delete(1);
    expect(result.periodoId).toBe(1);
  });
});
