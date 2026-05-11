import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateConvenioUseCase } from './create-convenio.use-case';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

describe('CreateConvenioUseCase', () => {
  let useCase: CreateConvenioUseCase;

  const mockPrismaService = {
    contratos: {
      findFirst: jest.fn(),
    },
    convenios: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    parametroTasainteres: {
      findFirst: jest.fn(),
    },
    estadoConvenio: {
      findUnique: jest.fn(),
    },
    estadoCuotaConvenio: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
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
        CreateConvenioUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
      ],
    }).compile();

    useCase = module.get<CreateConvenioUseCase>(CreateConvenioUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create convenio and generated cuotas in a transaction', async () => {
    const createdConvenio = { convenioId: 50n };
    const tx = {
      convenios: {
        create: jest.fn().mockResolvedValue(createdConvenio),
      },
      cuotaConvenio: {
        createMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
    };

    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 2,
    });
    mockPrismaService.parametroTasainteres.findFirst.mockResolvedValue({
      tasa: 1,
    });
    mockPrismaService.estadoConvenio.findUnique
      .mockResolvedValueOnce({ estadoConvenioId: 1n })
      .mockResolvedValueOnce({ estadoConvenioId: 2n });
    mockPrismaService.estadoCuotaConvenio.findUnique.mockResolvedValue({
      estadoCuotaConvenioId: 10n,
    });
    mockPrismaService.$transaction.mockImplementation((callback) =>
      callback(tx),
    );
    mockPrismaService.convenios.findUnique.mockResolvedValue({
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
        estadoConvenioId: 2n,
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
          saldoPendiente: 30.9,
          estadoCuotaConvenioId: 10n,
          interesMoraAplicado: 0.9,
        }),
        expect.objectContaining({ numeroCuota: 2, valorCuota: 30.9 }),
        expect.objectContaining({ numeroCuota: 3, valorCuota: 30.9 }),
      ],
    });
    expect(mockPrismaService.convenios.findUnique).toHaveBeenCalledWith({
      where: { convenioId: 50n },
      select: expect.any(Object),
    });
  });

  it('should use PREPARADO status when there is no initial payment', async () => {
    const tx = {
      convenios: {
        create: jest.fn().mockResolvedValue({ convenioId: 51n }),
      },
      cuotaConvenio: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });
    mockPrismaService.parametroTasainteres.findFirst.mockResolvedValue(null);
    mockPrismaService.estadoConvenio.findUnique
      .mockResolvedValueOnce({ estadoConvenioId: 1n })
      .mockResolvedValueOnce({ estadoConvenioId: 2n });
    mockPrismaService.estadoCuotaConvenio.findUnique.mockResolvedValue({
      estadoCuotaConvenioId: 10n,
    });
    mockPrismaService.$transaction.mockImplementation((callback) =>
      callback(tx),
    );
    mockPrismaService.convenios.findUnique.mockResolvedValue({
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
          estadoConvenioId: 1n,
          motivo: null,
        }),
      }),
    );
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when contrato already has active convenio', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue({
      convenioId: 9n,
      estado: { codigo: 'ACTIVO' },
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockGetDebtSummaryUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when debt is zero', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 0,
      maxMesesAtrasado: 0,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when initial payment covers the debt', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });

    await expect(
      useCase.execute({ ...dto, abonoInicial: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when required statuses are missing', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({
      deudaTotal: 100,
      maxMesesAtrasado: 0,
    });
    mockPrismaService.parametroTasainteres.findFirst.mockResolvedValue(null);
    mockPrismaService.estadoConvenio.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ estadoConvenioId: 2n });
    mockPrismaService.estadoCuotaConvenio.findUnique.mockResolvedValue({
      estadoCuotaConvenioId: 10n,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
  });
});
