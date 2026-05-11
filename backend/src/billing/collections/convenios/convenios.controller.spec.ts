import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';

describe('ConveniosController', () => {
  let controller: ConveniosController;
  let service: jest.Mocked<ConveniosService>;

  const mockConveniosService = {
    findAllEstadosConvenio: jest.fn(),
    findAllEstadosCuotaConvenio: jest.fn(),
    getDebtSummary: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findCuotas: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConveniosController],
      providers: [
        { provide: ConveniosService, useValue: mockConveniosService },
      ],
    }).compile();

    controller = module.get<ConveniosController>(ConveniosController);
    service = module.get(ConveniosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get convenio statuses', async () => {
    service.findAllEstadosConvenio.mockResolvedValue([]);

    await expect(controller.findAllStatuses()).resolves.toEqual([]);
    expect(service.findAllEstadosConvenio).toHaveBeenCalled();
  });

  it('should get installment statuses', async () => {
    service.findAllEstadosCuotaConvenio.mockResolvedValue([]);

    await expect(controller.findAllInstallmentStatuses()).resolves.toEqual([]);
    expect(service.findAllEstadosCuotaConvenio).toHaveBeenCalled();
  });

  it('should get debt summary', async () => {
    service.getDebtSummary.mockResolvedValue({ contratoId: '10' } as any);

    await expect(controller.getDebtSummary('10')).resolves.toEqual({
      contratoId: '10',
    });
    expect(service.getDebtSummary).toHaveBeenCalledWith('10');
  });

  it('should create convenio', async () => {
    const dto = {
      contratoId: '10',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    };
    service.create.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.create(dto)).resolves.toEqual({ convenioId: '1' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all convenios with optional contrato filter', async () => {
    service.findAll.mockResolvedValue([]);

    await expect(controller.findAll('10')).resolves.toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith('10');
  });

  it('should find one convenio', async () => {
    service.findOne.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.findOne('1')).resolves.toEqual({
      convenioId: '1',
    });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should find convenio installments', async () => {
    service.findCuotas.mockResolvedValue([]);

    await expect(controller.findInstallments('1')).resolves.toEqual([]);
    expect(service.findCuotas).toHaveBeenCalledWith('1');
  });

  it('should cancel convenio', async () => {
    service.cancel.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.cancel('1')).resolves.toEqual({ convenioId: '1' });
    expect(service.cancel).toHaveBeenCalledWith('1');
  });
});
