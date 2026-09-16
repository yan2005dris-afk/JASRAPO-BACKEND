import {
  CollectionCutoffService,
  deriveMonthlyDueDate,
} from './collection-cutoff.service';
import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from 'src/infrastructure/config/sistema-config.keys';

describe('CollectionCutoffService', () => {
  const customer = {
    nombres: 'Ana',
    apellidos: 'Luz',
    razonSocial: null,
    identificacion: '1',
  };

  const makeService = (values: Record<string, string | null> = {}) => {
    const prisma = {
      prefacturas: { findMany: jest.fn() },
      contratos: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
    };
    const config = {
      getString: jest.fn((key: string) => Promise.resolve(values[key] ?? null)),
    };
    return {
      service: new CollectionCutoffService(prisma as never, config as never),
      prisma,
    };
  };

  const debtRows = (count: number, convenio = false) =>
    Array.from({ length: count }, (_, index) => ({
      contratoId: 7n,
      periodoId: index + 1,
      mes: index + 1,
      totalPagar: 10,
      abono: 0,
      saldoActual: 10,
      periodoRel: { fechaVencimiento: new Date('2026-01-15T00:00:00.000Z') },
      prefacturaDetalle: convenio
        ? [{ cuotaConvenioId: 90n, deletedAt: null }]
        : [],
      contrato: {
        numeroGuia: 'G-7',
        estadoCobranza: 'AL_DIA',
        cliente: customer,
        comunidad: { comunidadId: 2, nombre: 'Centro' },
        convenios: [{ convenioId: 9n }],
      },
    }));

  it('uses the agreed defaults and rejects invalid positive integer values', async () => {
    const { service } = makeService();
    await expect(service.getConfig()).resolves.toEqual({
      diaCorteMensual: 15,
      mesesParaMora: 3,
      mesesParaCorte: 5,
    });

    const invalid = makeService({ [COBRANZA_DIA_CORTE_MENSUAL]: '0' });
    await expect(invalid.service.getConfig()).rejects.toThrow('entre 1 y 31');
    const invalidOrder = makeService({
      [COBRANZA_MESES_PARA_MORA]: '6',
      [COBRANZA_MESES_PARA_CORTE]: '5',
    });
    await expect(invalidOrder.service.getConfig()).rejects.toThrow(
      'mayor o igual',
    );
  });

  it('matches the configured day in Ecuador time at both UTC boundaries', () => {
    const { service } = makeService();
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-09-15T04:59:59Z'), 15),
    ).toBe(false);
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-09-15T05:00:00Z'), 15),
    ).toBe(true);
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-09-16T04:59:59Z'), 15),
    ).toBe(true);
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-09-16T05:00:00Z'), 15),
    ).toBe(false);
  });

  it('normalizes configured day 31 to the last Ecuador calendar day', () => {
    const { service } = makeService();
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-02-28T05:00:00Z'), 31),
    ).toBe(true);
    expect(
      service.isConfiguredEvaluationDay(new Date('2026-03-30T05:00:00Z'), 31),
    ).toBe(false);
  });

  it.each([
    [2, 'DEUDA_PENDIENTE', 'AL_DIA', false],
    [3, 'EN_MORA', 'EN_MORA', false],
    [4, 'EN_MORA', 'EN_MORA', false],
    [5, 'EN_MORA', 'EN_MORA', true],
  ])(
    'applies the exact threshold at %i due periods',
    async (count, evaluationStatus, collectionStatus, cutEligible) => {
      const { service, prisma } = makeService();
      prisma.prefacturas.findMany.mockResolvedValue(debtRows(count));

      const [candidate] = await service.evaluate(new Date('2026-12-01'));

      expect(candidate).toMatchObject({
        periodosVencidos: count,
        estadoEvaluacion: evaluationStatus,
        estadoCobranza: collectionStatus,
        elegibleParaCorte: cutEligible,
      });
      if (count < 3) {
        expect(candidate.razon).toContain('deuda pendiente');
      }
    },
  );

  it('excludes convenio-linked preinvoice details from current-service debt', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([]);

    await expect(service.evaluate(new Date('2026-12-01'))).resolves.toEqual([]);
    expect(prisma.prefacturas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] },
          mes: { gt: 0 },
          saldoActual: { gt: 0 },
          prefacturaDetalle: {
            none: { deletedAt: null, cuotaConvenioId: { not: null } },
          },
        }),
      }),
    );
  });

  it('derives the active convenio flag without counting financed rows toward cutoff', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue(debtRows(4));

    const [candidate] = await service.evaluate(
      new Date('2026-12-31T00:00:00.000Z'),
    );

    expect(candidate).toMatchObject({
      tieneConvenioActivo: true,
      periodosVencidos: 4,
      elegibleParaCorte: false,
    });
  });

  it.each([
    [2026, 1, 31, '2026-01-31'],
    [2026, 2, 31, '2026-02-28'],
    [2024, 2, 31, '2024-02-29'],
    [2026, 12, 31, '2026-12-31'],
  ])(
    'derives a calendar-safe monthly due date',
    (year, month, day, expected) => {
      expect(
        deriveMonthlyDueDate(
          new Date(Date.UTC(year, 11, day)),
          month,
        ).toISOString(),
      ).toBe(`${expected}T00:00:00.000Z`);
    },
  );

  it('uses each invoice month instead of the annual period month', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([
      { ...debtRows(1)[0], mes: 1 },
      { ...debtRows(1)[0], periodoId: 2, mes: 2 },
    ]);

    const [candidate] = await service.evaluate(
      new Date('2026-02-28T00:00:00.000Z'),
    );

    expect(candidate.periodosVencidos).toBe(2);
  });

  it('excludes installation invoices and carry-forward-only balances', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([
      { ...debtRows(1)[0], mes: 0, totalPagar: 10, abono: 0 },
      {
        ...debtRows(1)[0],
        periodoId: 2,
        mes: 1,
        totalPagar: 0,
        abono: 0,
        saldoActual: 50,
      },
    ]);

    await expect(
      service.evaluate(new Date('2026-12-31T00:00:00.000Z')),
    ).resolves.toEqual([]);
  });

  it('does not turn paid current service into a cut candidate because of an active convenio', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([]);

    await expect(service.evaluate(new Date('2026-12-01'))).resolves.toEqual([]);
    expect(prisma.contratos.updateMany).not.toHaveBeenCalled();
  });

  it('updates only the current-service collection status field', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue(debtRows(5));
    prisma.contratos.findMany.mockResolvedValue([]);

    await service.evaluateAndUpdateStatus(new Date('2026-12-01'));

    expect(prisma.contratos.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ estadoCobranza: 'AL_DIA' }),
        data: { estadoCobranza: 'EN_MORA' },
      }),
    );
    expect(prisma.contratos.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: expect.anything() }),
      }),
    );
  });

  it('recalculates a legacy agreement marker as current before migration', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([
      {
        ...debtRows(5)[0],
        contrato: { ...debtRows(5)[0].contrato, estadoCobranza: 'EN_CONVENIO' },
      },
    ]);

    await service.evaluateAndUpdateStatus(new Date('2026-12-01'));

    expect(prisma.contratos.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { estadoCobranza: 'AL_DIA' },
      }),
    );
  });

  it('never writes EN_CONVENIO to estadoCobranza', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue(debtRows(5));
    prisma.contratos.findMany.mockResolvedValue([]);

    await service.evaluateAndUpdateStatus(new Date('2026-12-01'));

    for (const call of prisma.contratos.updateMany.mock.calls) {
      expect(call[0].data.estadoCobranza).toBe('EN_MORA');
      expect(call[0].data.estadoCobranza).not.toBe('EN_CONVENIO');
    }
  });
});
