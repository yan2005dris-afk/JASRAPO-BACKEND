import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { safeAgreementWithInstallmentsSelect } from '../../infrastructure/repositories/prisma-agreement.repository';

@Injectable()
export class FindOneAgreementUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(convenioId: bigint) {
    const convenio = await this.agreementRepository.findFirstConvenio(
      { convenioId, deletedAt: null },
      safeAgreementWithInstallmentsSelect,
    );

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return convenio;
  }
}
