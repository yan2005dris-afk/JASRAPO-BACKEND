import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('GetDebtSummaryUseCase', () => {
  let useCase: GetDebtSummaryUseCase;

  const mockPrisma = {
    contratos: { findUnique: jest.fn() },
    prefacturas: { findMany: jest.fn() },
    parametroTasainteres: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDebtSummaryUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetDebtSummaryUseCase>(GetDebtSummaryUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when contract does not exist', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return zero debt when no unpaid prefacturas exist', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.prefacturas.findMany.mockResolvedValue([]);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    const result = await useCase.execute(BigInt(1));

    expect(result.deudaTotal).toBe(0);
    expect(result.totalPrefacturasImpagadas).toBe(0);
    expect(result.prefacturas).toHaveLength(0);
    expect(result.contratoId).toBe('1');
  });

  it('should calculate total debt from unpaid prefacturas', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.prefacturas.findMany.mockResolvedValue([
      {
        prefacturaId: BigInt(10),
        periodoId: 202503,
        totalPagar: { valueOf: () => 100 }, // Decimal mock
        abono: { valueOf: () => 20 },
        estado: 'APROBADA',
        createdAt: new Date('2025-03-15'),
      },
      {
        prefacturaId: BigInt(11),
        periodoId: 202504,
        totalPagar: { valueOf: () => 80 },
        abono: { valueOf: () => 0 },
        estado: 'GENERADA',
        createdAt: new Date('2025-04-15'),
      },
    ]);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    const result = await useCase.execute(BigInt(1));

    // saldo prefactura 1: 100 - 20 = 80
    // saldo prefactura 2: 80 - 0 = 80
    // total: 160
    expect(result.deudaTotal).toBe(160);
    expect(result.totalPrefacturasImpagadas).toBe(2);
    expect(result.tasaMensualVigente).toBe(1.5);
    expect(result.prefacturas[0].saldoPendiente).toBe(80);
    expect(result.prefacturas[1].saldoPendiente).toBe(80);
  });

  it('should return tasaMensualVigente as 0 when no interest rate configured', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.prefacturas.findMany.mockResolvedValue([]);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue(null);

    const result = await useCase.execute(BigInt(1));

    expect(result.tasaMensualVigente).toBe(0);
  });

  it('should not count abono as negative saldo (floor at 0)', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.prefacturas.findMany.mockResolvedValue([
      {
        prefacturaId: BigInt(10),
        periodoId: 202501,
        totalPagar: { valueOf: () => 50 },
        abono: { valueOf: () => 60 }, // abono mayor al total (caso borde)
        estado: 'APROBADA',
        createdAt: new Date('2025-01-15'),
      },
    ]);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    const result = await useCase.execute(BigInt(1));

    expect(result.prefacturas[0].saldoPendiente).toBe(0);
    expect(result.deudaTotal).toBe(0);
  });
});
