import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { CreateAgreementUseCase } from './create-agreement.use-case';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

describe('CreateAgreementUseCase', () => {
  let useCase: CreateAgreementUseCase;

  const mockAgreementRepository = {
    findFirstContrato: jest.fn(),
    findFirstConvenio: jest.fn(),
    findFirstParametroTasainteres: jest.fn(),
    findUniqueConvenio: jest.fn(),
    executeTransaction: jest.fn(),
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

  it('should create agreement and generate installments in a transaction', async () => {
    const createdConvenio = { convenioId: 50n };
    const tx = {
      convenios: { create: jest.fn().mockResolvedValue(createdConvenio) },
      cuotaConvenio: { createMany: jest.fn().mockResolvedValue({ count: 3 }) },
    };

    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 2,
    });
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue({
      tasa: 1,
    });
    mockAgreementRepository.executeTransaction.mockImplementation((callback) =>
      callback(tx),
    );
    mockAgreementRepository.findUniqueConvenio.mockResolvedValue({
      convenioId: 50n,
      cuotaConvenio: [],
    });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ convenioId: 50n, cuotaConvenio: [] });
    expect(tx.convenios.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contratoId: 1n,
        numeroCuotas: 3,
        abonoInicial: 10,
        deudaTotal: 100,
        mesesMoraActual: 2,
        estado: 'PENDIENTE_ABONO',
        montoPagadoActual: 0,
        motivo: 'Solicitud del cliente',
      }),
      select: { convenioId: true },
    });
    expect(tx.cuotaConvenio.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          convenioId: 50n,
          numeroCuota: 1,
          valorCuota: 30.9,
          interesMoraAplicado: 0.9,
        }),
        expect.objectContaining({ numeroCuota: 2, valorCuota: 30.9 }),
        expect.objectContaining({ numeroCuota: 3, valorCuota: 30.9 }),
      ],
    });
  });

  it('should use PREPARADO status when there is no initial payment', async () => {
    const tx = {
      convenios: { create: jest.fn().mockResolvedValue({ convenioId: 51n }) },
      cuotaConvenio: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
    };

    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue(
      null,
    );
    mockAgreementRepository.executeTransaction.mockImplementation((callback) =>
      callback(tx),
    );
    mockAgreementRepository.findUniqueConvenio.mockResolvedValue({
      convenioId: 51n,
    });

    await useCase.execute({
      contratoId: '1',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    });

    expect(tx.convenios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          abonoInicial: 0,
          estado: 'PREPARADO',
          motivo: null,
        }),
      }),
    );
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when contrato already has active agreement', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue({
      convenioId: 9n,
      estado: 'ACTIVO',
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when debt is zero', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 0,
      maxMesesAtrasado: 0,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when initial payment covers the debt', async () => {
    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });

    await expect(
      useCase.execute({ ...dto, abonoInicial: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should resolve when no initial payment and no rate found', async () => {
    const tx = {
      convenios: { create: jest.fn().mockResolvedValue({ convenioId: 51n }) },
      cuotaConvenio: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
    };

    mockAgreementRepository.findFirstContrato.mockResolvedValue({
      contratoId: 1n,
    });
    mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });
    mockAgreementRepository.findFirstParametroTasainteres.mockResolvedValue(
      null,
    );
    mockAgreementRepository.executeTransaction.mockImplementation((callback) =>
      callback(tx),
    );
    mockAgreementRepository.findUniqueConvenio.mockResolvedValue({
      convenioId: 51n,
    });

    await expect(
      useCase.execute({ ...dto, abonoInicial: 0 }),
    ).resolves.toBeDefined();
  });
});
