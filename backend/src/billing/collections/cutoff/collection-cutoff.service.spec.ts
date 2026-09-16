import { CollectionCutoffService } from './collection-cutoff.service';
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
      saldoActual: 10,
      periodoRel: { fechaVencimiento: new Date(`2026-0${index + 1}-15`) },
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
          estado: { notIn: ['ANULADA', 'PAGADA'] },
          saldoActual: { gt: 0 },
          prefacturaDetalle: {
            none: { deletedAt: null, cuotaConvenioId: { not: null } },
          },
        }),
      }),
    );
  });

  it('does not turn paid current service into a cut candidate because of an active convenio', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([]);

    await expect(service.evaluate(new Date('2026-12-01'))).resolves.toEqual([]);
    expect(prisma.contratos.updateMany).not.toHaveBeenCalled();
  });

  it('preserves EN_CONVENIO and only updates the collection status field', async () => {
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

  it('does not overwrite a contract already marked EN_CONVENIO', async () => {
    const { service, prisma } = makeService();
    prisma.prefacturas.findMany.mockResolvedValue([
      {
        ...debtRows(5)[0],
        contrato: { ...debtRows(5)[0].contrato, estadoCobranza: 'EN_CONVENIO' },
      },
    ]);

    await service.evaluateAndUpdateStatus(new Date('2026-12-01'));

    expect(prisma.contratos.updateMany).not.toHaveBeenCalled();
  });
});
