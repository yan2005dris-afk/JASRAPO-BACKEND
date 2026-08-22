import type { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentsReportSpec } from './payments-report.report-spec';

describe('PaymentsReportSpec', () => {
  it('paymentsReportEmissionUsesBilledPeriodName', async () => {
    const prisma = {
      pagos: {
        findMany: jest.fn().mockResolvedValue([
          {
            fechaPago: new Date('2024-05-20T15:00:00.000Z'),
            cliente: {
              nombres: 'Ana',
              apellidos: 'Pérez',
              razonSocial: null,
            },
            detallePago: [
              {
                montoAbonado: 25,
                comprobante: {
                  secuencial: 'F-001',
                  fechaEmision: new Date('2024-05-20T00:00:00.000Z'),
                  prefactura: {
                    periodoRel: { nombre: 'ABRIL 2024' },
                    contrato: {
                      contratoId: 10n,
                      historialMedidores: [{ medidor: { serie: 'M-001' } }],
                    },
                  },
                },
              },
            ],
          },
        ]),
      },
    };
    const spec = new PaymentsReportSpec(prisma as unknown as PrismaService);

    const result = await spec.fetchData({});
    const pagos = result['pagos'] as Record<string, unknown>[];

    expect(pagos[0]?.['emision']).toBe('ABRIL 2024');
    expect(pagos[0]?.['emision']).not.toContain('20/05/2024');
  });
});
