import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from 'src/generated/prisma/client';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

/**
 * Seleccionar que incluye los datos necesarios para el PDF de Convenio de Pago:
 * - contrato con datos del cliente
 * - primera cuota para calcular el valor mensual
 */
const PDF_CONVENIO_SELECT = {
  convenioId: true,
  contratoId: true,
  deudaTotal: true,
  abonoInicial: true,
  numeroCuotas: true,
  fechaPrimerPago: true,
  motivo: true,
  createdAt: true,
  contrato: {
    select: {
      numeroGuia: true,
      direccionSuministro: true,
      cliente: {
        select: {
          nombres: true,
          apellidos: true,
          razonSocial: true,
          identificacion: true,
        },
      },
    },
  },
  cuotaConvenio: {
    where: { numeroCuota: 1, deletedAt: null },
    take: 1,
    select: { valorCuota: true },
  },
} satisfies Prisma.ConveniosSelect;

/**
 * Datos planos que necesita la plantilla PDF de convenio de pago.
 */
export interface PaymentAgreementPdfRawData {
  convenio: {
    convenioId: string;
    contratoId: string;
    deudaTotal: number;
    abonoInicial: number;
    numeroCuotas: number;
    fechaPrimerPago: string;
    motivo: string;
    createdAt: string;
    cuotaMensual: number;
    contrato: {
      numeroGuia: string;
      direccionSuministro: string;
    };
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
      identificacion: string;
    };
  };
}

@Injectable()
export class GetPaymentAgreementPdfDataUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(convenioId: bigint): Promise<PaymentAgreementPdfRawData> {
    const convenio = await this.agreementRepository.findFirstConvenio(
      { convenioId, deletedAt: null },
      PDF_CONVENIO_SELECT,
    );

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return {
      convenio: {
        convenioId: String(convenio.convenioId),
        contratoId: String(convenio.contratoId),
        deudaTotal: Number(convenio.deudaTotal),
        abonoInicial: Number(convenio.abonoInicial),
        numeroCuotas: convenio.numeroCuotas,
        fechaPrimerPago: convenio.fechaPrimerPago.toISOString(),
        motivo: convenio.motivo,
        createdAt: convenio.createdAt.toISOString(),
        cuotaMensual: Number(convenio.cuotaConvenio[0]?.valorCuota ?? 0),
        contrato: {
          numeroGuia: convenio.contrato.numeroGuia,
          direccionSuministro: convenio.contrato.direccionSuministro,
        },
        cliente: {
          nombres: convenio.contrato.cliente.nombres,
          apellidos: convenio.contrato.cliente.apellidos,
          razonSocial: convenio.contrato.cliente.razonSocial,
          identificacion: convenio.contrato.cliente.identificacion,
        },
      },
    };
  }
}
