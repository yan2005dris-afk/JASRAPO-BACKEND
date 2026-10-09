jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AgreementRepository } from '../domain/repositories/agreement.repository';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './use-cases/update-agreement.use-case';
import { GetPaymentAgreementPdfDataUseCase } from './use-cases/get-payment-agreement-pdf-data.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ReportStyleDispatcher } from 'src/reports/application/report-style.dispatcher';
import { AgreementsService } from './agreements.service';
import { agreementRow } from '../__test-utils__/agreement-row.factory';
import { cuotaRow } from '../__test-utils__/cuota-row.factory';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';

describe('AgreementsService', () => {
  let service: AgreementsService;

  const mockAgreementRepository = {
    paginate: jest.fn(),
    findInstallmentsByAgreementId: jest.fn(),
  };

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockGetDebtSummaryUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockGetPaymentAgreementPdfData = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockReportStyleDispatcher = {
    dispatch: jest.fn().mockResolvedValue({ buffer: Buffer.from('pdf') }),
  };
  const mockInstitutionalProfiles = {
    resolve: jest.fn().mockResolvedValue({
      institucion: { version: 'test-v1' },
      metadatosDocumento: {
        perfilInstitucional: { version: 'test-v1' },
      },
    }),
    attach: jest.fn((document, context) => ({ ...document, ...context })),
  };

  const convenioRecord = agreementRow({
    convenioId: 1n,
    contratoId: 10n,
    numeroCuotas: 2,
    estado: 'PREPARADO',
  });

  const cuotaRecord = cuotaRow({
    cuotaConvenioId: 1n,
    convenioId: 1n,
    numeroCuota: 1,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgreementsService,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
        { provide: CreateAgreementUseCase, useValue: mockCreateUseCase },
        { provide: FindOneAgreementUseCase, useValue: mockFindOneUseCase },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
        { provide: UpdateAgreementUseCase, useValue: mockUpdateUseCase },
        {
          provide: GetPaymentAgreementPdfDataUseCase,
          useValue: mockGetPaymentAgreementPdfData,
        },
        { provide: GeneratePdfUseCase, useValue: mockGeneratePdf },
        {
          provide: ReportStyleDispatcher,
          useValue: mockReportStyleDispatcher,
        },
        {
          provide: InstitutionalProfileResolver,
          useValue: mockInstitutionalProfiles,
        },
      ],
    }).compile();

    service = module.get<AgreementsService>(AgreementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return active agreement states mapped from enum', async () => {
    const result = await service.findAllAgreementStates();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'ACTIVO' }),
        expect.objectContaining({ codigo: 'PENDIENTE_ABONO' }),
        expect.objectContaining({ codigo: 'PREPARADO' }),
        expect.objectContaining({ codigo: 'ANULADO' }),
        expect.objectContaining({ codigo: 'PAGADO' }),
      ]),
    );
    expect(result).toHaveLength(5);
  });

  it('should return active installment states mapped from enum', async () => {
    const result = await service.findAllInstallmentStates();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'PENDIENTE' }),
        expect.objectContaining({ codigo: 'PAGADA' }),
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('should delegate debt summary with contratoId as bigint', async () => {
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({ contratoId: '10' });

    const result = await service.getDebtSummary(10n);

    expect(result).toEqual({ contratoId: '10' });
    expect(mockGetDebtSummaryUseCase.execute).toHaveBeenCalledWith(10n);
  });

  it('should create agreement through use case and return entity', async () => {
    mockCreateUseCase.execute.mockResolvedValue(convenioRecord);

    const result = await service.create({
      contratoId: '10',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    });

    expect(result).toBe(convenioRecord);
  });

  it('should return paginated agreements without contrato filter', async () => {
    const paginatedResult = {
      data: [convenioRecord],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
      },
    };
    mockAgreementRepository.paginate.mockResolvedValue(paginatedResult);

    const result = await service.findAll({
      pagination: { page: 1, limit: 10 },
    });

    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].convenioId).toBe(1n);
    expect(mockAgreementRepository.paginate).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { contratoId: undefined },
    );
  });

  it('should find one agreement through use case', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);

    const result = await service.findOne(1n);

    expect(result.convenioId).toBe(1n);
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1n);
  });

  it('should validate agreement before returning installments', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);
    mockAgreementRepository.findInstallmentsByAgreementId.mockResolvedValue([
      cuotaRecord,
    ]);

    const result = await service.findInstallments('1');

    expect(result).toEqual([cuotaRecord]);
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1n);
    expect(
      mockAgreementRepository.findInstallmentsByAgreementId,
    ).toHaveBeenCalledWith(1n);
  });

  it('should update agreement estado through use case', async () => {
    const updatedRecord = agreementRow({
      ...convenioRecord,
      estado: 'PAGADO',
    });
    mockUpdateUseCase.execute.mockResolvedValue(updatedRecord);

    const result = await service.update(1n, { estado: 'PAGADO' });

    expect(result.estado).toBe('PAGADO');
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(1n, 'PAGADO');
  });

  it('should cancel agreement with ANULADO status', async () => {
    mockUpdateUseCase.execute.mockResolvedValue(
      agreementRow({
        ...convenioRecord,
        estado: 'ANULADO',
      }),
    );

    const result = await service.cancel(1n);

    expect(result.estado).toBe('ANULADO');
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(1n, 'ANULADO');
  });
});
