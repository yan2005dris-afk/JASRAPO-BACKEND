import { Injectable } from '@nestjs/common';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import { attachInstitutionalProfile } from '../models/institutional-report';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import type { ProjectedReport } from '../models/report-projection';
import type { ReportRequestContext } from '../models/report-request-context';
import { PaymentsReportQueryPort } from '../ports/report-query.ports';
import type {
  PaymentsReportDocument,
  PaymentsReportFilters,
  PaymentsReportGroup,
  PaymentsReportReadModel,
} from '../read-models/payments-report.read-model';

interface MutablePaymentGroup extends PaymentsReportGroup {
  subtotalNumber: number;
}

export function projectPaymentsReport(
  readModel: PaymentsReportReadModel,
): ProjectedReport<PaymentsReportDocument> {
  const groupsByInvoice = new Map<string, MutablePaymentGroup>();
  let totalGeneral = 0;
  let totalRecords = 0;

  for (const payment of readModel.payments) {
    const clientName = resolveClientName(payment.client) || '—';
    const paymentDate = payment.paymentDate.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    for (const detail of payment.details) {
      const invoice = detail.invoiceNumber ?? '—';
      let group = groupsByInvoice.get(invoice);
      if (!group) {
        group = {
          factura: invoice,
          fecha: paymentDate,
          clienteNombre: clientName,
          cuenta: detail.contractId ?? '—',
          medidor: detail.meterSerial ?? '—',
          filas: [],
          subtotal: '0.00',
          subtotalNumber: 0,
        };
        groupsByInvoice.set(invoice, group);
      }

      group.filas.push({
        emision: detail.billedPeriodName ?? '—',
        valor: detail.amount.toFixed(2),
      });
      group.subtotalNumber += detail.amount;
      totalGeneral += detail.amount;
      totalRecords += 1;
    }
  }

  const groups = Array.from(groupsByInvoice.values()).map(
    ({ subtotalNumber, ...group }) => ({
      ...group,
      subtotal: subtotalNumber.toFixed(2),
    }),
  );

  return {
    document: {
      reporte: {
        titulo: 'Reporte de Abonos',
        fechaDesde: readModel.filters.fechaDesde ?? '--',
        fechaHasta: readModel.filters.fechaHasta ?? '--',
        fechaEmision: readModel.generatedAt.toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        grupos: groups,
        totalGeneral: totalGeneral.toFixed(2),
        totalRegistros: totalRecords,
      },
    },
    recipientEmail: readModel.recipientEmail,
  };
}

@Injectable()
export class PaymentsReportDefinition {
  constructor(
    private readonly queryPort: PaymentsReportQueryPort,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async generate(
    context: ReportRequestContext<PaymentsReportFilters>,
  ): Promise<ProjectedReport<OfficialDocument<PaymentsReportDocument>>> {
    const [readModel, institutional] = await Promise.all([
      this.queryPort.query(context),
      this.institutionalProfiles.resolve(new Date()),
    ]);
    return attachInstitutionalProfile(
      projectPaymentsReport(readModel),
      institutional,
    );
  }
}
