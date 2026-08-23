import { Injectable } from '@nestjs/common';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import type { ProjectedReport } from '../models/report-projection';
import { ConnectionHistoryReportQueryPort } from '../ports/report-query.ports';
import type {
  ConnectionHistoryReportDocument,
  ConnectionHistoryReportFilters,
  ConnectionHistoryReportReadModel,
} from '../read-models/connection-history.read-model';

export function projectConnectionHistoryReport(
  readModel: ConnectionHistoryReportReadModel,
): ProjectedReport<ConnectionHistoryReportDocument> {
  const rows = readModel.invoices.map((invoice) => ({
    emision: invoice.periodName ?? '—',
    lectActual: invoice.currentReading.toFixed(0),
    lectAnterior: invoice.previousReading.toFixed(0),
    consumo: invoice.consumption.toFixed(0),
    valEmision: invoice.billedAmount.toFixed(2),
    abonos: invoice.paidAmount.toFixed(2),
    saldo: invoice.outstandingBalance.toFixed(2),
  }));
  const billedTotal = readModel.invoices.reduce(
    (sum, invoice) => sum + invoice.billedAmount,
    0,
  );
  const paidTotal = readModel.invoices.reduce(
    (sum, invoice) => sum + invoice.paidAmount,
    0,
  );
  const outstandingTotal = readModel.invoices.reduce(
    (sum, invoice) => sum + invoice.outstandingBalance,
    0,
  );

  return {
    document: {
      reporte: {
        titulo: 'Historial de Conexión',
        fechaEmision: readModel.generatedAt.toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        fechaDesde: readModel.filters.fechaDesde ?? '--',
        fechaHasta: readModel.filters.fechaHasta ?? '--',
        cuenta: readModel.contractId,
        clienteNombre: readModel.client
          ? resolveClientName(readModel.client)
          : '—',
        medidor: readModel.meterSerial ?? '—',
        filas: rows,
        totalValEmision: billedTotal.toFixed(2),
        totalAbonos: paidTotal.toFixed(2),
        saldoFinal: outstandingTotal.toFixed(2),
      },
    },
    recipientEmail: readModel.recipientEmail,
  };
}

@Injectable()
export class ConnectionHistoryReportDefinition {
  constructor(private readonly queryPort: ConnectionHistoryReportQueryPort) {}

  async generate(
    filters: ConnectionHistoryReportFilters,
  ): Promise<ProjectedReport<ConnectionHistoryReportDocument>> {
    return projectConnectionHistoryReport(await this.queryPort.query(filters));
  }
}
