import { Injectable } from '@nestjs/common';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import { attachInstitutionalProfile } from '../models/institutional-report';
import type { ProjectedReport } from '../models/report-projection';
import type { ReportRequestContext } from '../models/report-request-context';
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

function describeFiltros(
  filters: OverdueAccountsReportFilters,
  fechaCorte: string,
): OverdueAccountsReportDocument['filtros'] {
  let descripcion = 'Todos los clientes';
  if (filters.contratoId) descripcion = 'Contrato específico';
  else if (filters.clienteId) descripcion = 'Cliente específico';
  else if (filters.sectorId) descripcion = 'Sector específico';

  return {
    descripcion,
    fechaCorte,
    clienteId: filters.clienteId,
    contratoId: filters.contratoId,
    sectorId: filters.sectorId,
  };
}

export function projectOverdueAccountsReport(
  readModel: OverdueAccountsReportReadModel,
  filters: OverdueAccountsReportFilters = {},
  timeZone?: string,
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
  // Se formatea la fecha de corte en la zona horaria del contexto para que el
  // día mostrado coincida con el instante realmente consultado.
  const fechaCorte = readModel.cutoffDate.toLocaleDateString(
    'es-EC',
    timeZone ? { timeZone } : undefined,
  );

  return {
    document: {
      data: overdueAccounts,
      meta: {
        total: overdueAccounts.length,
        fechaCorte,
      },
      kpis: {
        totalMorosidad: totalDebt.toFixed(2),
        totalMorosos: overdueAccounts.length,
        mayorDeuda: largestDebt.toFixed(2),
      },
      filtros: describeFiltros(filters, fechaCorte),
    },
    recipientEmail: null,
  };
}

@Injectable()
export class OverdueAccountsReportDefinition {
  constructor(
    private readonly queryPort: OverdueAccountsReportQueryPort,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async generate(
    context: ReportRequestContext<OverdueAccountsReportFilters>,
  ): Promise<ProjectedReport<OfficialDocument<OverdueAccountsReportDocument>>> {
    const [readModel, institutional] = await Promise.all([
      this.queryPort.query(context),
      this.institutionalProfiles.resolve(new Date()),
    ]);
    return attachInstitutionalProfile(
      projectOverdueAccountsReport(
        readModel,
        context.filters,
        context.timeZone,
      ),
      institutional,
    );
  }
}
