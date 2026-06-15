import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

/**
 * Datos planos que necesita la plantilla PDF de Acta de Responsabilidad.
 */
export interface ResponsibilityAgreementPdfRawData {
  acta: {
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
      identificacion: string;
    };
    fechaFirmado: string;
  };
}

@Injectable()
export class GetResponsibilityAgreementPdfDataUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    contratoId: bigint,
  ): Promise<ResponsibilityAgreementPdfRawData> {
    const contrato = await this.contractRepository.findUnique({
      contratoId,
    });

    if (!contrato || contrato.deletedAt) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    return {
      acta: {
        cliente: {
          nombres: contrato.cliente?.nombres ?? '',
          apellidos: contrato.cliente?.apellidos ?? '',
          razonSocial: contrato.cliente?.razonSocial ?? null,
          identificacion: contrato.cliente?.identificacion ?? '',
        },
        fechaFirmado: new Date().toLocaleDateString('es-EC', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    };
  }
}
