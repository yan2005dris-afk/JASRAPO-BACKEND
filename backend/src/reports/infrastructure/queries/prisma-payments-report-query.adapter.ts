import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentsReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  PaymentsReportFilters,
  PaymentsReportReadModel,
} from '../../application/read-models/payments-report.read-model';
import { normalizeReportDateRange } from './report-date-range';

@Injectable()
export class PrismaPaymentsReportQueryAdapter extends PaymentsReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    filters: PaymentsReportFilters,
  ): Promise<PaymentsReportReadModel> {
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      filters.fechaDesde,
      filters.fechaHasta,
    );
    const [payments, recipient] = await Promise.all([
      this.prisma.pagos.findMany({
        where: {
          deletedAt: null,
          estadoValidacion: { not: 'RECHAZADO' },
          ...(filters.fechaDesde || filters.fechaHasta
            ? {
                fechaPago: {
                  ...(startInclusive ? { gte: startInclusive } : {}),
                  ...(endExclusive ? { lt: endExclusive } : {}),
                },
              }
            : {}),
          ...(filters.clienteId
            ? { clienteId: BigInt(filters.clienteId) }
            : {}),
          detallePago: { some: { tipoPago: 'COMPROBANTE', deletedAt: null } },
        },
        include: {
          cliente: {
            select: { nombres: true, apellidos: true, razonSocial: true },
          },
          detallePago: {
            where: { tipoPago: 'COMPROBANTE', deletedAt: null },
            include: {
              comprobante: {
                include: {
                  prefactura: {
                    include: {
                      periodoRel: { select: { nombre: true } },
                      contrato: {
                        select: {
                          contratoId: true,
                          historialMedidores: {
                            where: { fechaHasta: null },
                            take: 1,
                            select: { medidor: { select: { serie: true } } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { fechaPago: 'asc' },
      }),
      filters.clienteId
        ? this.prisma.clientes.findUnique({
            where: { clienteId: BigInt(filters.clienteId) },
            select: { email: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      payments: payments.map((payment) => ({
        paymentDate: payment.fechaPago,
        client: {
          nombres: payment.cliente?.nombres ?? null,
          apellidos: payment.cliente?.apellidos ?? null,
          razonSocial: payment.cliente?.razonSocial ?? null,
        },
        details: payment.detallePago.map((detail) => {
          const preInvoice = detail.comprobante?.prefactura;
          const contract = preInvoice?.contrato;
          return {
            invoiceNumber: detail.comprobante?.secuencial ?? null,
            billedPeriodName: preInvoice?.periodoRel?.nombre ?? null,
            contractId: contract ? String(contract.contratoId) : null,
            meterSerial: contract?.historialMedidores[0]?.medidor.serie ?? null,
            amount: Number(detail.montoAbonado),
          };
        }),
      })),
      filters,
      recipientEmail: recipient?.email ?? null,
      generatedAt: new Date(),
    };
  }
}
