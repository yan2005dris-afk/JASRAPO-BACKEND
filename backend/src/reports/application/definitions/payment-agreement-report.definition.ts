import { Injectable } from '@nestjs/common';
import {
  formatCurrency,
  formatDate,
  formatDateInWords,
  formatMonthYear,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';
import type { ProjectedReport } from '../models/report-projection';
import { PaymentAgreementReportQueryPort } from '../ports/report-query.ports';
import type {
  PaymentAgreementReportDocument,
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel,
} from '../read-models/payment-agreement.read-model';

export function projectPaymentAgreementReport(
  readModel: PaymentAgreementReportReadModel,
): ProjectedReport<PaymentAgreementReportDocument> {
  const agreement = readModel.convenio;

  return {
    document: {
      convenio: {
        fecha: formatDate(agreement.createdAt),
        numeroGuia: agreement.contrato.numeroGuia,
        clienteNombre: resolveClientName(agreement.cliente),
        clienteCI: agreement.cliente.identificacion,
        cuotaMensual: formatCurrency(agreement.cuotaMensual),
        primeraCuota: formatCurrency(agreement.primeraCuota),
        deudaTotal: formatCurrency(agreement.deudaTotal),
        abonoInicial: formatCurrency(agreement.abonoInicial),
        numeroCuotas: agreement.numeroCuotas,
        mesPrimerPago: agreement.fechaPrimerPago
          ? formatMonthYear(agreement.fechaPrimerPago)
          : undefined,
        periodoInicio: agreement.periodoInicio
          ? formatMonthYear(agreement.periodoInicio)
          : undefined,
        fechaActual: formatDateInWords(agreement.createdAt),
      },
    },
    recipientEmail: agreement.cliente.email,
  };
}

@Injectable()
export class PaymentAgreementReportDefinition {
  constructor(private readonly queryPort: PaymentAgreementReportQueryPort) {}

  async generate(
    filters: PaymentAgreementReportFilters,
  ): Promise<ProjectedReport<PaymentAgreementReportDocument>> {
    return projectPaymentAgreementReport(await this.queryPort.query(filters));
  }
}
