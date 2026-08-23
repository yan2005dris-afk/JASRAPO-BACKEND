import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ConnectionHistoryReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  ConnectionHistoryReportFilters,
  ConnectionHistoryReportReadModel,
} from '../../application/read-models/connection-history.read-model';
import { normalizeReportDateRange } from './report-date-range';

@Injectable()
export class PrismaConnectionHistoryReportQueryAdapter extends ConnectionHistoryReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    filters: ConnectionHistoryReportFilters,
  ): Promise<ConnectionHistoryReportReadModel> {
    const contractId = BigInt(filters.contratoId);
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      filters.fechaDesde,
      filters.fechaHasta,
    );
    const [contract, preInvoices] = await Promise.all([
      this.prisma.contratos.findFirst({
        where: { contratoId: contractId, deletedAt: null },
        select: {
          cliente: {
            select: {
              nombres: true,
              apellidos: true,
              razonSocial: true,
              email: true,
            },
          },
          historialMedidores: {
            where: { fechaHasta: null },
            take: 1,
            select: { medidor: { select: { serie: true } } },
          },
        },
      }),
      this.prisma.prefacturas.findMany({
        where: {
          contratoId: contractId,
          deletedAt: null,
          estado: { not: 'ANULADA' },
          ...(filters.fechaDesde || filters.fechaHasta
            ? {
                periodoRel: {
                  ...(startInclusive
                    ? { fechaInicio: { gte: startInclusive } }
                    : {}),
                  ...(endExclusive ? { fechaFin: { lt: endExclusive } } : {}),
                },
              }
            : {}),
        },
        include: { periodoRel: { select: { nombre: true } } },
        orderBy: { periodoRel: { fechaInicio: 'asc' } },
      }),
    ]);

    return {
      contractId: filters.contratoId,
      client: contract?.cliente
        ? {
            nombres: contract.cliente.nombres,
            apellidos: contract.cliente.apellidos,
            razonSocial: contract.cliente.razonSocial,
          }
        : null,
      meterSerial: contract?.historialMedidores[0]?.medidor.serie ?? null,
      invoices: preInvoices.map((preInvoice) => ({
        periodName: preInvoice.periodoRel?.nombre ?? null,
        currentReading: Number(preInvoice.lecturaActual ?? 0),
        previousReading: Number(preInvoice.lecturaAnterior ?? 0),
        consumption: Number(preInvoice.consumoM3 ?? 0),
        billedAmount: Number(preInvoice.totalPagar ?? 0),
        paidAmount: Number(preInvoice.abono ?? 0),
        outstandingBalance: Number(preInvoice.saldoActual ?? 0),
      })),
      filters,
      recipientEmail: contract?.cliente.email ?? null,
      generatedAt: new Date(),
    };
  }
}
