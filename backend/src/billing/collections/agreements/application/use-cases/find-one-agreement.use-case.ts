import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import type { AgreementRow } from '../../domain/types/agreement.types';

@Injectable()
export class FindOneAgreementUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(convenioId: bigint): Promise<AgreementRow> {
    const convenio = await this.agreementRepository.findById(convenioId);

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return convenio;
  }
}
