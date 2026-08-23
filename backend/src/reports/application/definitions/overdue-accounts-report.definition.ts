import { Injectable } from '@nestjs/common';
import type { ProjectedReport } from '../models/report-projection';
import { OverdueAccountsReportQueryPort } from '../ports/report-query.ports';
import type {
  OverdueAccountItem,
  OverdueAccountsReportDocument,
  OverdueAccountsReportFilters,
  OverdueAccountsReportReadModel,
} from '../read-models/overdue-accounts.read-model';

interface OverdueAccountAccumulator extends OverdueAccountItem {
  invoiceCount: number;
}

export function projectOverdueAccountsReport(
  readModel: OverdueAccountsReportReadModel,
): ProjectedReport<OverdueAccountsReportDocument> {
  const accountsByContract = new Map<string, OverdueAccountAccumulator>();

  for (const invoice of readModel.invoices) {
    const current = accountsByContract.get(invoice.contractId);
    if (!current) {
      accountsByContract.set(invoice.contractId, {
        contratoId: invoice.contractId,
        numeroGuia: invoice.guideNumber,
        clienteNombre: invoice.clientName,
        identificacion: invoice.identification,
        sectorNombre: invoice.sectorName,
        mesesVencidos: 1,
        saldoPendiente: invoice.outstandingBalance.toFixed(2),
        saldoPendienteNum: invoice.outstandingBalance,
        ultimaEmision: invoice.billedPeriodName,
        medidorSerie: invoice.meterSerial,
        invoiceCount: 1,
      });
      continue;
    }

    current.invoiceCount += 1;
    current.mesesVencidos = current.invoiceCount;
    current.saldoPendienteNum += invoice.outstandingBalance;
    current.saldoPendiente = current.saldoPendienteNum.toFixed(2);
    current.ultimaEmision = invoice.billedPeriodName;
  }

  const overdueAccounts = Array.from(accountsByContract.values())
    .map(({ invoiceCount: _invoiceCount, ...account }) => account)
    .sort((left, right) => right.saldoPendienteNum - left.saldoPendienteNum);
  const totalDebt = overdueAccounts.reduce(
    (sum, account) => sum + account.saldoPendienteNum,
    0,
  );
  const largestDebt = overdueAccounts[0]?.saldoPendienteNum ?? 0;

  return {
    document: {
      data: overdueAccounts,
      meta: {
        total: overdueAccounts.length,
        fechaCorte: readModel.cutoffDate.toLocaleDateString('es-EC'),
      },
      kpis: {
        totalMorosidad: totalDebt.toFixed(2),
        totalMorosos: overdueAccounts.length,
        mayorDeuda: largestDebt.toFixed(2),
      },
    },
    recipientEmail: null,
  };
}

@Injectable()
export class OverdueAccountsReportDefinition {
  constructor(private readonly queryPort: OverdueAccountsReportQueryPort) {}

  async generate(
    filters: OverdueAccountsReportFilters,
  ): Promise<ProjectedReport<OverdueAccountsReportDocument>> {
    return projectOverdueAccountsReport(await this.queryPort.query(filters));
  }
}
