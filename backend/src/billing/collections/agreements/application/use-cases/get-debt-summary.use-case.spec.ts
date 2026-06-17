import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

describe('GetDebtSummaryUseCase', () => {
  let useCase: GetDebtSummaryUseCase;

  const mockAgreementRepository = {
    findFirstContrato: jest.fn(),
    findManyPrefacturas: jest.fn(),
    findFirstParametroTasainteres: jest.fn(),
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
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findManyPrefacturas.mockResolvedValue([
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
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue({
      tasa: 1.5,
    });

    const result = await useCase.execute(1n);

    // deudaTotal = (100-25) + (80-0) = 155
    // deudaAnterior = saldo del periodo 202602-1=202601 → 100-25 = 75
    // maxMesesAtrasado = 2 (ambos periodos tienen saldo > 0)
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
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findManyPrefacturas.mockResolvedValue([]);
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue(
      null,
    );

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

  it('should return deudaAnterior = 0 when there is no preceding period', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findManyPrefacturas.mockResolvedValue([
      {
        prefacturaId: 20n,
        periodoId: 202601,
        totalPagar: 60,
        abono: 0,
        estado: 'GENERADA',
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
      },
    ]);
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue(
      null,
    );

    const result = await useCase.execute(1n);

    // Only one period → no preceding period exists → deudaAnterior = 0
    expect(result.deudaAnterior).toBe(0);
    expect(result.deudaTotal).toBe(60);
    expect(result.maxMesesAtrasado).toBe(1);
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue(null);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
    expect(mockAgreementRepository.findManyPrefacturas).not.toHaveBeenCalled();
  });
});
