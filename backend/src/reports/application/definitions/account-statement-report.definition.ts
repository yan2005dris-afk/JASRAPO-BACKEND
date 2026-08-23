import { Injectable } from '@nestjs/common';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import type { ProjectedReport } from '../models/report-projection';
import { AccountStatementReportQueryPort } from '../ports/report-query.ports';
import type {
  AccountStatementReportDocument,
  AccountStatementReportFilters,
  AccountStatementReportReadModel,
  AccountStatementYear,
} from '../read-models/account-statement.read-model';

export function projectAccountStatementReport(
  readModel: AccountStatementReportReadModel,
): ProjectedReport<AccountStatementReportDocument> {
  const contract = readModel.contract;
  const minimumConsumption = contract?.minimumMonthlyConsumption ?? 0;
  const baseValue = contract?.baseValue ?? 0;
  const excessValue = contract?.excessValuePerM3 ?? 0;
  const years: AccountStatementYear[] = [];
  let totalDebt = 0;

  for (const period of readModel.periods) {
    let accumulatedBalance = 0;
    const monthlyPayment =
      period.annualPayment > 0
        ? Number((period.annualPayment / 12).toFixed(2))
        : 0;
    const months = period.readings.map((reading, index) => {
      const baseConsumption = Math.min(reading.consumption, minimumConsumption);
      const excessConsumption = Math.max(
        reading.consumption - minimumConsumption,
        0,
      );
      const excessPrice = excessConsumption * excessValue;
      const monthTotal = baseValue + excessPrice;
      const adjustedPayment =
        index === 11
          ? period.annualPayment - monthlyPayment * 11
          : monthlyPayment;

      accumulatedBalance += monthTotal - adjustedPayment;

      return {
        mes: reading.date
          .toLocaleString('es-EC', { month: 'short' })
          .toUpperCase(),
        lectActual: reading.currentReading.toFixed(0),
        lectAnterior: reading.previousReading.toFixed(0),
        consu: baseConsumption.toFixed(0),
        excede: excessConsumption.toFixed(0),
        cargoFijo: baseValue.toFixed(2),
        excedenteValor: excessPrice.toFixed(2),
        total: monthTotal.toFixed(2),
        intMora: '0.00',
        tasaSeg: '0.00',
        convenio: '0.00',
        totalMes: monthTotal.toFixed(2),
        pagos: adjustedPayment.toFixed(2),
        saldo: accumulatedBalance.toFixed(2),
      };
    });

    const annualSubtotal = months.reduce(
      (sum, month) => sum + Number(month.totalMes),
      0,
    );
    const paymentsTotal = months.reduce(
      (sum, month) => sum + Number(month.pagos),
      0,
    );
    const finalBalance =
      months.length > 0 ? Number(months[months.length - 1].saldo) : 0;
    totalDebt += finalBalance;

    years.push({
      nombre: period.periodName ?? '—',
      meses: months,
      subtotalAnual: annualSubtotal.toFixed(2),
      pagos: paymentsTotal.toFixed(2),
      saldo: finalBalance.toFixed(2),
    });
  }

  return {
    document: {
      reporte: {
        titulo: 'Estado de Cuenta',
        fechaEmision: readModel.generatedAt.toLocaleDateString('es-EC'),
        sector: contract?.sectorName ?? '—',
        cuenta: contract?.guideNumber ?? '—',
        medidor: contract?.meterSerial ?? '—',
        tarifaTipo: contract?.tariffName ?? '—',
        clienteNombre: contract ? resolveClientName(contract.client) : '—',
        clienteIdentificacion: contract?.client.identificacion ?? '—',
        clienteDireccion: contract?.supplyAddress ?? '—',
        cargoFijo: baseValue.toFixed(2),
        factor: excessValue.toFixed(2),
        years,
        deudaTotal: totalDebt.toFixed(2),
      },
    },
    recipientEmail: contract?.client.email ?? null,
  };
}

@Injectable()
export class AccountStatementReportDefinition {
  constructor(private readonly queryPort: AccountStatementReportQueryPort) {}

  async generate(
    filters: AccountStatementReportFilters,
  ): Promise<ProjectedReport<AccountStatementReportDocument>> {
    return projectAccountStatementReport(await this.queryPort.query(filters));
  }
}
