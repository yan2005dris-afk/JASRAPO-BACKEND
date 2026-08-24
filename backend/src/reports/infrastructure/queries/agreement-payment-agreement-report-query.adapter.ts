import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from 'src/billing/collections/agreements/domain/repositories/agreement.repository';
import { PaymentAgreementReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel,
} from '../../application/read-models/payment-agreement.read-model';
import type { ReportRequestContext } from '../../application/models/report-request-context';

@Injectable()
export class AgreementPaymentAgreementReportQueryAdapter extends PaymentAgreementReportQueryPort {
  constructor(private readonly agreementRepository: AgreementRepository) {
    super();
  }

  async query(
    context: ReportRequestContext<PaymentAgreementReportFilters>,
  ): Promise<PaymentAgreementReportReadModel> {
    const { filters } = context;
    const data = await this.agreementRepository.getPdfData(
      BigInt(filters.convenioId),
    );
    if (!data) {
      throw new NotFoundException(
        `Convenio con ID ${filters.convenioId} no encontrado`,
      );
    }
    return data;
  }
}
