import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { CreateAgreementUseCase } from './create-agreement.use-case';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';
import { agreementRow } from '../../__test-utils__/agreement-row.factory';

describe('CreateAgreementUseCase', () => {
  let useCase: CreateAgreementUseCase;

  const mockAgreementRepository = {
    contractExists: jest.fn(),
    findActiveByContractId: jest.fn(),
    findActiveInterestRate: jest.fn(),
    create: jest.fn(),
  };

  const mockGetDebtSummaryUseCase = {
    execute: jest.fn(),
  };

  const dto = {
    contratoId: '1',
    numeroCuotas: 3,
    abonoInicial: 10,
    fechaPrimerPago: '2026-06-01',
    motivo: 'Solicitud del cliente',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAgreementUseCase,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
      ],
    }).compile();

    useCase = module.get<CreateAgreementUseCase>(CreateAgreementUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create agreement and generate installments', async () => {
    const createdConvenio = agreementRow({
      convenioId: 50n,
      contratoId: 1n,
      numeroCuotas: 3,
      estado: 'PENDIENTE_ABONO',
      motivo: 'Solicitud del cliente',
    });

    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findActiveByContractId.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 2,
    });
    mockAgreementRepository.findActiveInterestRate.mockResolvedValue(1);
    mockAgreementRepository.create.mockResolvedValue(createdConvenio);

    const result = await useCase.execute(dto);

    expect(result).toBe(createdConvenio);
    expect(mockAgreementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        contratoId: 1n,
        numeroCuotas: 3,
        abonoInicial: 10,
        deudaTotal: 100,
        mesesMoraActual: 2,
        estado: 'PENDIENTE_ABONO',
        montoPagadoActual: 0,
        motivo: 'Solicitud del cliente',
      }),
      expect.arrayContaining([
        expect.objectContaining({
          numeroCuota: 1,
          valorCuota: 30.9,
          interesMoraAplicado: 0.9,
        }),
        expect.objectContaining({ numeroCuota: 2, valorCuota: 30.9 }),
        expect.objectContaining({ numeroCuota: 3, valorCuota: 30.9 }),
      ]),
    );
  });

  it('should use PREPARADO status when there is no initial payment', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findActiveByContractId.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });
    mockAgreementRepository.findActiveInterestRate.mockResolvedValue(null);
    mockAgreementRepository.create.mockResolvedValue(
      agreementRow({ convenioId: 51n, estado: 'PREPARADO' }),
    );

    await useCase.execute({
      contratoId: '1',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    });

    expect(mockAgreementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        abonoInicial: 0,
        estado: 'PREPARADO',
        motivo: null,
      }),
      expect.any(Array),
    );
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when contrato already has active agreement', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findActiveByContractId.mockResolvedValue(
      agreementRow({ convenioId: 9n, estado: 'ACTIVO' }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when debt is zero', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findActiveByContractId.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 0,
      maxMesesAtrasado: 0,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when initial payment covers the debt', async () => {
    mockAgreementRepository.contractExists.mockResolvedValue(true);
    mockAgreementRepository.findActiveByContractId.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });

    await expect(
      useCase.execute({ ...dto, abonoInicial: 100 }),
    ).rejects.toThrow(BadRequestException);
  });
});
