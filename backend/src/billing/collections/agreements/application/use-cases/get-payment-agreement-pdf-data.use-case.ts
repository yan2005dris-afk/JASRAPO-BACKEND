import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import type { PaymentAgreementReportReadModel } from '../../domain/types/agreement.types';

@Injectable()
export class GetPaymentAgreementPdfDataUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(convenioId: bigint): Promise<PaymentAgreementReportReadModel> {
    const data = await this.agreementRepository.getPdfData(convenioId);

    if (!data) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return data;
  }
}
