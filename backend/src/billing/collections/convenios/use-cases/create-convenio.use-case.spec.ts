import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateConvenioUseCase } from './create-convenio.use-case';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateConvenioUseCase', () => {
  let useCase: CreateConvenioUseCase;
  let getDebtSummaryUseCase: GetDebtSummaryUseCase;

  // ── Shared mock data ───────────────────────────────────────────────────────

  const mockDebtSummary = {
    contratoId: '1',
    deudaTotal: 200,
    tasaMensualVigente: 1.5,
    totalPrefacturasImpagadas: 2,
    prefacturas: [
      { prefacturaId: '10', saldoPendiente: 100, fechaCreacion: '2025-03-15' },
      { prefacturaId: '11', saldoPendiente: 100, fechaCreacion: '2025-04-15' },
    ],
  };

  const mockEstadoPreparado = { estadoConvenioId: BigInt(1) };
  const mockEstadoPendienteAbono = { estadoConvenioId: BigInt(2) };
  const mockEstadoCuotaPendiente = { estadoCuotaConvenioId: BigInt(1) };

  const mockConvenioCreado = {
    convenioId: BigInt(1),
    contratoId: BigInt(1),
    numeroCuotas: 3,
    abonoInicial: { valueOf: () => 0 },
    deudaTotal: { valueOf: () => 200 },
    diasMoraActual: 55,
    estado: {
      estadoConvenioId: BigInt(1),
      codigo: 'PREPARADO',
      nombre: 'Preparado',
    },
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01'),
    fechaProximoPago: new Date('2026-06-01'),
    montoPagadoActual: { valueOf: () => 0 },
    motivo: null,
    createdAt: new Date('2026-05-10'),
    cuotaConvenio: [
      {
        cuotaConvenioId: BigInt(1),
        convenioId: BigInt(1),
        numeroCuota: 1,
        valorCuota: { valueOf: () => 70 },
        fechaVencimiento: new Date('2026-06-01'),
        estado: {
          estadoCuotaConvenioId: BigInt(1),
          codigo: 'PENDIENTE',
          nombre: 'Pendiente',
        },
        fechaPago: null,
        montoPagado: { valueOf: () => 0 },
        saldoPendiente: { valueOf: () => 70 },
        diasRetraso: 0,
        interesMoraAplicado: { valueOf: () => 3 },
        pagoCompleto: false,
        fechaPagoAnticipado: null,
      },
    ],
  };

  const mockPrisma = {
    contratos: { findUnique: jest.fn() },
    convenios: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    estadoConvenio: { findUnique: jest.fn() },
    estadoCuotaConvenio: { findUnique: jest.fn() },
    parametroTasainteres: { findFirst: jest.fn() },
    cuotaConvenio: { createMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockGetDebtSummary = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateConvenioUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummary },
      ],
    }).compile();

    useCase = module.get<CreateConvenioUseCase>(CreateConvenioUseCase);
    getDebtSummaryUseCase = module.get<GetDebtSummaryUseCase>(
      GetDebtSummaryUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // ── NotFoundException ──────────────────────────────────────────────────────

  it('should throw NotFoundException when contract does not exist', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        contratoId: '999',
        numeroCuotas: 3,
        abonoInicial: 0,
        fechaPrimerPago: '2026-06-01',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // ── BadRequestException — convenio activo ya existe ───────────────────────

  it('should throw BadRequestException when an active convenio already exists', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue({
      convenioId: BigInt(5),
      estado: { codigo: 'ACTIVO' },
    });

    await expect(
      useCase.execute({
        contratoId: '1',
        numeroCuotas: 3,
        abonoInicial: 0,
        fechaPrimerPago: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── BadRequestException — sin deuda ──────────────────────────────────────

  it('should throw BadRequestException when contract has no debt', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue({
      ...mockDebtSummary,
      deudaTotal: 0,
    });

    await expect(
      useCase.execute({
        contratoId: '1',
        numeroCuotas: 3,
        abonoInicial: 0,
        fechaPrimerPago: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── BadRequestException — abono >= deuda ─────────────────────────────────

  it('should throw BadRequestException when abonoInicial >= deudaTotal', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue({
      ...mockDebtSummary,
      deudaTotal: 200,
    });

    await expect(
      useCase.execute({
        contratoId: '1',
        numeroCuotas: 3,
        abonoInicial: 200,
        fechaPrimerPago: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── Creación exitosa sin abono — estado PREPARADO ─────────────────────────

  it('should create convenio with PREPARADO state when no abonoInicial', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue(mockDebtSummary);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    mockPrisma.estadoConvenio.findUnique
      .mockResolvedValueOnce(mockEstadoPreparado) // PREPARADO
      .mockResolvedValueOnce(mockEstadoPendienteAbono); // PENDIENTE_ABONO
    mockPrisma.estadoCuotaConvenio.findUnique.mockResolvedValue(
      mockEstadoCuotaPendiente,
    );

    // Simulate transaction
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      mockPrisma.convenios.create.mockResolvedValue({ convenioId: BigInt(1) });
      mockPrisma.cuotaConvenio.createMany.mockResolvedValue({ count: 3 });
      return fn(mockPrisma);
    });

    mockPrisma.convenios.findUnique.mockResolvedValue(mockConvenioCreado);

    const result = await useCase.execute({
      contratoId: '1',
      numeroCuotas: 3,
      abonoInicial: 0,
      fechaPrimerPago: '2026-06-01',
    });

    expect(result).toBeDefined();
    expect(result!.estado.codigo).toBe('PREPARADO');
    // estadoConvenioId usado fue el PREPARADO (primera llamada)
    expect(mockPrisma.convenios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estadoConvenioId: mockEstadoPreparado.estadoConvenioId,
          numeroCuotas: 3,
          abonoInicial: 0,
        }),
      }),
    );
  });

  // ── Creación exitosa con abono — estado PENDIENTE_ABONO ───────────────────

  it('should create convenio with PENDIENTE_ABONO state when abonoInicial > 0', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue(mockDebtSummary); // deudaTotal: 200
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    mockPrisma.estadoConvenio.findUnique
      .mockResolvedValueOnce(mockEstadoPreparado)
      .mockResolvedValueOnce(mockEstadoPendienteAbono);
    mockPrisma.estadoCuotaConvenio.findUnique.mockResolvedValue(
      mockEstadoCuotaPendiente,
    );

    mockPrisma.$transaction.mockImplementation(async (fn) => {
      mockPrisma.convenios.create.mockResolvedValue({ convenioId: BigInt(1) });
      mockPrisma.cuotaConvenio.createMany.mockResolvedValue({ count: 3 });
      return fn(mockPrisma);
    });

    const mockConvenioPendienteAbono = {
      ...mockConvenioCreado,
      estado: {
        estadoConvenioId: BigInt(2),
        codigo: 'PENDIENTE_ABONO',
        nombre: 'Pendiente de Abono',
      },
    };
    mockPrisma.convenios.findUnique.mockResolvedValue(
      mockConvenioPendienteAbono,
    );

    const result = await useCase.execute({
      contratoId: '1',
      numeroCuotas: 3,
      abonoInicial: 50,
      fechaPrimerPago: '2026-06-01',
    });

    expect(result!.estado.codigo).toBe('PENDIENTE_ABONO');
    expect(mockPrisma.convenios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estadoConvenioId: mockEstadoPendienteAbono.estadoConvenioId,
          abonoInicial: 50,
        }),
      }),
    );
  });

  // ── Cálculo correcto de cuotas con intereses ──────────────────────────────

  it('should calculate installment amounts including mora interest', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue({
      ...mockDebtSummary,
      deudaTotal: 200,
    });
    // Tasa 1.5% mensual
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue({ tasa: 1.5 });

    mockPrisma.estadoConvenio.findUnique
      .mockResolvedValueOnce(mockEstadoPreparado)
      .mockResolvedValueOnce(mockEstadoPendienteAbono);
    mockPrisma.estadoCuotaConvenio.findUnique.mockResolvedValue(
      mockEstadoCuotaPendiente,
    );

    let capturedCuotas: any[] = [];
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      mockPrisma.convenios.create.mockResolvedValue({ convenioId: BigInt(1) });
      mockPrisma.cuotaConvenio.createMany.mockImplementation(({ data }) => {
        capturedCuotas = data;
        return Promise.resolve({ count: data.length });
      });
      return fn(mockPrisma);
    });
    mockPrisma.convenios.findUnique.mockResolvedValue(mockConvenioCreado);

    await useCase.execute({
      contratoId: '1',
      numeroCuotas: 4,
      abonoInicial: 0,
      fechaPrimerPago: '2026-06-01',
    });

    // montoAFinanciar = 200 - 0 = 200
    // interesesTotales = 200 * 0.015 * 4 = 12
    // totalADistribuir = 200 + 12 = 212
    // valorCuotaBase = floor(212/4 * 100)/100 = 53
    expect(capturedCuotas).toHaveLength(4);
    expect(capturedCuotas[0].valorCuota).toBe(53);
    expect(capturedCuotas[0].interesMoraAplicado).toBe(3); // 12/4
    expect(capturedCuotas[0].numeroCuota).toBe(1);
    expect(capturedCuotas[3].numeroCuota).toBe(4);
  });

  // ── Cuotas con fechas de vencimiento correctas ────────────────────────────

  it('should generate installments with correct monthly due dates', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue(mockDebtSummary);
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue(null); // sin interés

    mockPrisma.estadoConvenio.findUnique
      .mockResolvedValueOnce(mockEstadoPreparado)
      .mockResolvedValueOnce(mockEstadoPendienteAbono);
    mockPrisma.estadoCuotaConvenio.findUnique.mockResolvedValue(
      mockEstadoCuotaPendiente,
    );

    let capturedCuotas: any[] = [];
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      mockPrisma.convenios.create.mockResolvedValue({ convenioId: BigInt(1) });
      mockPrisma.cuotaConvenio.createMany.mockImplementation(({ data }) => {
        capturedCuotas = data;
        return Promise.resolve({ count: data.length });
      });
      return fn(mockPrisma);
    });
    mockPrisma.convenios.findUnique.mockResolvedValue(mockConvenioCreado);

    await useCase.execute({
      contratoId: '1',
      numeroCuotas: 3,
      abonoInicial: 0,
      fechaPrimerPago: '2026-06-01',
    });

    // Cuota 1: 2026-06-01 (mes 0)
    // Cuota 2: 2026-07-01 (mes 1)
    // Cuota 3: 2026-08-01 (mes 2)
    expect(capturedCuotas[0].fechaVencimiento.getMonth()).toBe(5); // junio (0-indexed)
    expect(capturedCuotas[1].fechaVencimiento.getMonth()).toBe(6); // julio
    expect(capturedCuotas[2].fechaVencimiento.getMonth()).toBe(7); // agosto
  });

  // ── Sin ParametroTasainteres — no aplica interés ──────────────────────────

  it('should create convenio without interest when no ParametroTasainteres configured', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
    });
    mockPrisma.convenios.findFirst.mockResolvedValue(null);
    mockGetDebtSummary.execute.mockResolvedValue({
      ...mockDebtSummary,
      deudaTotal: 120,
    });
    mockPrisma.parametroTasainteres.findFirst.mockResolvedValue(null);

    mockPrisma.estadoConvenio.findUnique
      .mockResolvedValueOnce(mockEstadoPreparado)
      .mockResolvedValueOnce(mockEstadoPendienteAbono);
    mockPrisma.estadoCuotaConvenio.findUnique.mockResolvedValue(
      mockEstadoCuotaPendiente,
    );

    let capturedCuotas: any[] = [];
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      mockPrisma.convenios.create.mockResolvedValue({ convenioId: BigInt(1) });
      mockPrisma.cuotaConvenio.createMany.mockImplementation(({ data }) => {
        capturedCuotas = data;
        return Promise.resolve({ count: data.length });
      });
      return fn(mockPrisma);
    });
    mockPrisma.convenios.findUnique.mockResolvedValue(mockConvenioCreado);

    await useCase.execute({
      contratoId: '1',
      numeroCuotas: 3,
      abonoInicial: 0,
      fechaPrimerPago: '2026-06-01',
    });

    // sin interés: 120 / 3 = 40 por cuota
    expect(capturedCuotas[0].valorCuota).toBe(40);
    expect(capturedCuotas[0].interesMoraAplicado).toBe(0);
  });
});
