jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from '../../application/agreements.service';
import { AgreementEntity } from '../../domain/entities/agreement.entity';
import { InstallmentEntity } from '../../domain/entities/installment.entity';

describe('AgreementsController', () => {
  let controller: AgreementsController;
  let service: jest.Mocked<AgreementsService>;

  const mockAgreement = new AgreementEntity({
    convenioId: 1n,
    contratoId: 10n,
    numeroCuotas: 2,
    abonoInicial: 5,
    deudaTotal: 100,
    mesesMoraActual: 1,
    estado: 'PREPARADO',
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01T00:00:00.000Z'),
    fechaProximoPago: new Date('2026-06-01T00:00:00.000Z'),
    montoPagadoActual: 0,
    motivo: null,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
  });

  const mockInstallment = new InstallmentEntity({
    cuotaConvenioId: 1n,
    convenioId: 1n,
    numeroCuota: 1,
    valorCuota: 50,
    fechaVencimiento: new Date('2026-06-01T00:00:00.000Z'),
    estado: 'PENDIENTE',
    fechaPago: null,
    montoPagado: 0,
    saldoPendiente: 50,
    diasRetraso: 0,
    interesMoraAplicado: 0,
    pagoCompleto: false,
    fechaPagoAnticipado: null,
  });

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

  it('should create agreement and return response dto', async () => {
    const dto = {
      contratoId: '10',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    };
    service.create.mockResolvedValue(mockAgreement);

    const result = await controller.create(dto);
    expect(result.convenioId).toBe('1');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all agreements with pagination and optional contrato filter', async () => {
    const paginatedResult = {
      data: [mockAgreement],
      meta: { total: 1 } as any,
    };
    service.findAll.mockResolvedValue(paginatedResult);

    const query = { page: 1, limit: 10, contratoId: '10' };
    const result = await controller.findAll(query);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].convenioId).toBe('1');
    expect(service.findAll).toHaveBeenCalledWith({
      pagination: { page: 1, limit: 10 },
      contratoId: '10',
    });
  });

  it('should find one agreement and return response dto', async () => {
    service.findOne.mockResolvedValue(mockAgreement);

    const result = await controller.findOne(1n);
    expect(result.convenioId).toBe('1');
    expect(service.findOne).toHaveBeenCalledWith(1n);
  });

  it('should find installments and return response dto list', async () => {
    service.findInstallments.mockResolvedValue([mockInstallment]);

    const result = await controller.findInstallments('1');
    expect(result).toHaveLength(1);
    expect(result[0].cuotaConvenioId).toBe('1');
    expect(service.findInstallments).toHaveBeenCalledWith('1');
  });

  it('should cancel agreement', async () => {
    service.cancel.mockResolvedValue(
      new AgreementEntity({ ...mockAgreement, estado: 'ANULADO' }),
    );

    const result = await controller.cancel(1n);
    expect(result.convenioId).toBe('1');
    expect(result.estado.codigo).toBe('ANULADO');
    expect(service.cancel).toHaveBeenCalledWith(1n);
  });

  it('should update agreement state', async () => {
    const dto = { estado: 'PAGADO' };
    service.update.mockResolvedValue(
      new AgreementEntity({ ...mockAgreement, estado: 'PAGADO' }),
    );

    const result = await controller.update(1n, dto);
    expect(result.convenioId).toBe('1');
    expect(result.estado.codigo).toBe('PAGADO');
    expect(service.update).toHaveBeenCalledWith(1n, dto);
  });
});
