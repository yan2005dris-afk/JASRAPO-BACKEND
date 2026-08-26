import { Injectable } from '@nestjs/common';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import { attachInstitutionalProfile } from '../models/institutional-report';
import {
  formatCurrency,
  formatDate,
  formatDateInWords,
  formatMonthYear,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';
import type { ProjectedReport } from '../models/report-projection';
import type { ReportRequestContext } from '../models/report-request-context';
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
          : 'No especificada',
        periodoInicio: agreement.periodoInicio
          ? formatMonthYear(agreement.periodoInicio)
          : 'No especificado',
        fechaActual: formatDateInWords(agreement.createdAt),
      },
    },
    recipientEmail: agreement.cliente.email,
  };
}

@Injectable()
export class PaymentAgreementReportDefinition {
  constructor(
    private readonly queryPort: PaymentAgreementReportQueryPort,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async generate(
    context: ReportRequestContext<PaymentAgreementReportFilters>,
  ): Promise<
    ProjectedReport<OfficialDocument<PaymentAgreementReportDocument>>
  > {
    const [readModel, institutional] = await Promise.all([
      this.queryPort.query(context),
      this.institutionalProfiles.resolve(new Date()),
    ]);
    return attachInstitutionalProfile(
      projectPaymentAgreementReport(readModel),
      institutional,
    );
  }
}
