import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from 'src/billing/collections/agreements/domain/repositories/agreement.repository';
import { PaymentAgreementReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel,
} from '../../application/read-models/payment-agreement.read-model';

@Injectable()
export class AgreementPaymentAgreementReportQueryAdapter extends PaymentAgreementReportQueryPort {
  constructor(private readonly agreementRepository: AgreementRepository) {
    super();
  }

  async query(
    filters: PaymentAgreementReportFilters,
  ): Promise<PaymentAgreementReportReadModel> {
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
