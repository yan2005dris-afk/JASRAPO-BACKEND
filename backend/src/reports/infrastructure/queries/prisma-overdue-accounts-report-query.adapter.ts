import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { OverdueAccountsReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  OverdueAccountsReportFilters,
  OverdueAccountsReportReadModel,
} from '../../application/read-models/overdue-accounts.read-model';
import type { ReportRequestContext } from '../../application/models/report-request-context';

@Injectable()
export class PrismaOverdueAccountsReportQueryAdapter extends OverdueAccountsReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    context: ReportRequestContext<OverdueAccountsReportFilters>,
  ): Promise<OverdueAccountsReportReadModel> {
    const { filters } = context;
    const cutoffDate = context.period.cutoffInclusive ?? new Date();
    const preInvoices = await this.prisma.prefacturas.findMany({
      where: {
        deletedAt: null,
        estado: { notIn: ['ANULADA', 'PAGADA'] },
        saldoActual: { gt: 0 },
        ...(filters.contratoId
          ? { contratoId: BigInt(filters.contratoId) }
          : {}),
        // clienteId y sectorId se combinan en un único predicado `contrato`
        // para que ambos filtros se apliquen juntos (uno no reemplaza al otro).
        ...(filters.clienteId || filters.sectorId
          ? {
              contrato: {
                ...(filters.clienteId
                  ? { clienteId: BigInt(filters.clienteId) }
                  : {}),
                ...(filters.sectorId
                  ? { sectorId: Number(filters.sectorId) }
                  : {}),
              },
            }
          : {}),
        periodoRel: { fechaFin: { lte: cutoffDate } },
      },
      include: {
        periodoRel: { select: { nombre: true } },
        contrato: {
          include: {
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
                razonSocial: true,
                identificacion: true,
              },
            },
            sector: { select: { nombre: true } },
            historialMedidores: {
              where: { fechaHasta: null },
              take: 1,
              select: { medidor: { select: { serie: true } } },
            },
          },
        },
      },
      orderBy: { periodoRel: { fechaInicio: 'asc' } },
    });

    return {
      invoices: preInvoices.map((preInvoice) => {
        const client = preInvoice.contrato?.cliente;
        const clientName =
          [client?.nombres, client?.apellidos].filter(Boolean).join(' ') ||
          client?.razonSocial ||
          '—';
        const contractId = String(preInvoice.contratoId);
        return {
          contractId,
          guideNumber: preInvoice.contrato?.numeroGuia || contractId,
          clientName,
          identification: client?.identificacion || '—',
          sectorName: preInvoice.contrato?.sector?.nombre || '—',
          meterSerial:
            preInvoice.contrato?.historialMedidores[0]?.medidor.serie || '—',
          outstandingBalance: Number(preInvoice.saldoActual || 0),
          billedPeriodName: preInvoice.periodoRel?.nombre || '—',
        };
      }),
      cutoffDate,
    };
  }
}
