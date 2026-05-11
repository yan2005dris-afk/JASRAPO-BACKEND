import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

describe('GetDebtSummaryUseCase', () => {
  let useCase: GetDebtSummaryUseCase;

  const mockPrismaService = {
    contratos: {
      findFirst: jest.fn(),
    },
    prefacturas: {
      findMany: jest.fn(),
    },
    parametroTasainteres: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDebtSummaryUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
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

  it('should calculate debt summary from unpaid prefacturas', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.prefacturas.findMany.mockResolvedValue([
      {
        prefacturaId: 10n,
        periodoId: 202601,
        totalPagar: 100,
        abono: 25,
        saldoActual: null,
        meses_atrasado: 2,
        estado: 'GENERADA',
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
      },
      {
        prefacturaId: 11n,
        periodoId: 202602,
        totalPagar: 80,
        abono: 0,
        saldoActual: 40.555,
        meses_atrasado: 4,
        estado: 'APROBADA',
        createdAt: new Date('2026-02-15T00:00:00.000Z'),
      },
    ]);
    mockPrismaService.parametroTasainteres.findFirst.mockResolvedValue({
      tasa: 1.5,
    });

    const result = await useCase.execute(1n);

    expect(result).toMatchObject({
      contratoId: '1',
      deudaTotal: 115.56,
      tasaMensualVigente: 1.5,
      maxMesesAtrasado: 4,
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
        saldoPendiente: 40.555,
        estado: 'APROBADA',
      }),
    ]);
    expect(mockPrismaService.prefacturas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contratoId: 1n,
          deletedAt: null,
          estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] },
        }),
        orderBy: { createdAt: 'asc' },
      }),
    );
  });

  it('should return zero totals when there are no unpaid prefacturas', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue({ contratoId: 1n });
    mockPrismaService.prefacturas.findMany.mockResolvedValue([]);
    mockPrismaService.parametroTasainteres.findFirst.mockResolvedValue(null);

    const result = await useCase.execute(1n);

    expect(result).toMatchObject({
      deudaTotal: 0,
      tasaMensualVigente: 0,
      maxMesesAtrasado: 0,
      totalPrefacturasImpagadas: 0,
      prefacturas: [],
    });
  });

  it('should throw NotFoundException when contrato does not exist', async () => {
    mockPrismaService.contratos.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
    expect(mockPrismaService.prefacturas.findMany).not.toHaveBeenCalled();
  });
});
