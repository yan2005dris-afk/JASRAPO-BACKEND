import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

describe('GetDebtSummaryUseCase', () => {
  let useCase: GetDebtSummaryUseCase;

  const mockAgreementRepository = {
    contractExists: jest.fn(),
    findUnpaidPreInvoices: jest.fn(),
    findActiveInterestRate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDebtSummaryUseCase,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
      ],
    }).compile();

    useCase = module.get<GetDebtSummaryUseCase>(GetDebtSummaryUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should calculate debt summary dynamically from totalPagar and abono', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findUnpaidPreInvoices.mockResolvedValue([
      {
        prefacturaId: 10n,
        periodoId: 202601,
        totalPagar: 100,
        abono: 25,
        estado: 'GENERADA',
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
      },
      {
        prefacturaId: 11n,
        periodoId: 202602,
        totalPagar: 80,
        abono: 0,
        estado: 'APROBADA',
        createdAt: new Date('2026-02-15T00:00:00.000Z'),
      },
    ]);
    mockAgreementRepository.findActiveInterestRate.mockResolvedValue(1.5);

    const result = await useCase.execute(1n);

    expect(result).toMatchObject({
      contratoId: '1',
      deudaTotal: 155,
      deudaAnterior: 75,
      tasaMensualVigente: 1.5,
      maxMesesAtrasado: 2,
      totalPrefacturasImpagadas: 2,
    });
    expect(result.prefacturas).toEqual([
      expect.objectContaining({
        prefacturaId: '10',
        saldoPendiente: 75,
        estado: 'GENERADA',
      }),
      expect.objectContaining({
        prefacturaId: '11',
        saldoPendiente: 80,
        estado: 'APROBADA',
      }),
    ]);
  });

  it('should return zero totals when there are no unpaid prefacturas', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findUnpaidPreInvoices.mockResolvedValue([]);
    mockAgreementRepository.findActiveInterestRate.mockResolvedValue(null);

    const result = await useCase.execute(1n);

    expect(result).toMatchObject({
      deudaTotal: 0,
      deudaAnterior: 0,
      tasaMensualVigente: 0,
      maxMesesAtrasado: 0,
      totalPrefacturasImpagadas: 0,
      prefacturas: [],
    });
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(false);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
    expect(
      mockAgreementRepository.findUnpaidPreInvoices,
    ).not.toHaveBeenCalled();
  });
});
