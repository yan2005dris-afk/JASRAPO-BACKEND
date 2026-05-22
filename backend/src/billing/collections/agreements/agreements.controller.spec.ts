import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';

describe('AgreementsController', () => {
  let controller: AgreementsController;
  let service: jest.Mocked<AgreementsService>;

  const mockAgreementsService = {
    findAllAgreementStates: jest.fn(),
    findAllInstallmentStates: jest.fn(),
    getDebtSummary: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findInstallments: jest.fn(),
    cancel: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgreementsController],
      providers: [
        { provide: AgreementsService, useValue: mockAgreementsService },
      ],
    }).compile();

    controller = module.get<AgreementsController>(AgreementsController);
    service = module.get(AgreementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get agreement states', async () => {
    service.findAllAgreementStates.mockResolvedValue([]);

    await expect(controller.findAllStates()).resolves.toEqual([]);
    expect(service.findAllAgreementStates).toHaveBeenCalled();
  });

  it('should get installment states', async () => {
    service.findAllInstallmentStates.mockResolvedValue([]);

    await expect(controller.findAllInstallmentStates()).resolves.toEqual([]);
    expect(service.findAllInstallmentStates).toHaveBeenCalled();
  });

  it('should get debt summary', async () => {
    service.getDebtSummary.mockResolvedValue({ contratoId: '10' } as any);

    await expect(controller.getDebtSummary(10n)).resolves.toEqual({
      contratoId: '10',
    });
    expect(service.getDebtSummary).toHaveBeenCalledWith(10n);
  });

  it('should create agreement', async () => {
    const dto = {
      contratoId: '10',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    };
    service.create.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.create(dto)).resolves.toEqual({ convenioId: '1' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all agreements with pagination and optional contrato filter', async () => {
    const paginatedResult = { data: [], meta: {} as any };
    service.findAll.mockResolvedValue(paginatedResult);

    const query = { page: 1, limit: 10, contratoId: '10' };
    await expect(controller.findAll(query)).resolves.toEqual(paginatedResult);
    expect(service.findAll).toHaveBeenCalledWith({
      pagination: { page: 1, limit: 10 },
      contratoId: '10',
    });
  });

  it('should find one agreement', async () => {
    service.findOne.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.findOne(1n)).resolves.toEqual({
      convenioId: '1',
    });
    expect(service.findOne).toHaveBeenCalledWith(1n);
  });

  it('should cancel agreement', async () => {
    service.cancel.mockResolvedValue({ convenioId: '1' } as any);

    await expect(controller.cancel(1n)).resolves.toEqual({ convenioId: '1' });
    expect(service.cancel).toHaveBeenCalledWith(1n);
  });

  it('should update agreement state', async () => {
    const dto = { estado: 'PAGADO' };
    service.update.mockResolvedValue({
      convenioId: '1',
      estado: 'PAGADO',
    } as any);

    await expect(controller.update(1n, dto)).resolves.toEqual({
      convenioId: '1',
      estado: 'PAGADO',
    });
    expect(service.update).toHaveBeenCalledWith(1n, dto);
  });
});
