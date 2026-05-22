import { DateUtil } from '../../../../infrastructure/common/utils/date.util';
import type { AgreementResponseDto } from '../dto/agreement-response.dto';
import type { InstallmentResponseDto } from '../dto/installment-response.dto';

/**
 * Mapea un resultado de Prisma CuotaConvenio al DTO de respuesta
 */
export function toInstallmentResponse(cuota: any): InstallmentResponseDto {
  return {
    cuotaConvenioId: String(cuota.cuotaConvenioId),
    convenioId: String(cuota.convenioId),
    numeroCuota: cuota.numeroCuota,
    valorCuota: Number(cuota.valorCuota),
    fechaVencimiento: DateUtil.formatForFrontend(cuota.fechaVencimiento)!,
    estado: {
      codigo: cuota.estado,
      nombre: cuota.estado,
    },
    fechaPago: DateUtil.formatForFrontend(cuota.fechaPago),
    montoPagado: Number(cuota.montoPagado),
    saldoPendiente: Number(cuota.saldoPendiente),
    diasRetraso: cuota.diasRetraso,
    interesMoraAplicado: Number(cuota.interesMoraAplicado),
    pagoCompleto: cuota.pagoCompleto,
    fechaPagoAnticipado: DateUtil.formatForFrontend(cuota.fechaPagoAnticipado),
  };
}

/**
 * Mapea un resultado de Prisma Convenios al DTO de respuesta
 * Convierte BigInt → string, Decimal → number, Date → YYYY-MM-DD
 */
export function toAgreementResponse(convenio: any): AgreementResponseDto {
  return {
    convenioId: String(convenio.convenioId),
    contratoId: String(convenio.contratoId),
    numeroCuotas: convenio.numeroCuotas,
    abonoInicial: Number(convenio.abonoInicial),
    deudaTotal: Number(convenio.deudaTotal),
    mesesMoraActual: convenio.mesesMoraActual,
    estado: {
      codigo: convenio.estado,
      nombre: convenio.estado,
    },
    fechaAprobacion: DateUtil.formatForFrontend(convenio.fechaAprobacion),
    fechaPrimerPago: DateUtil.formatForFrontend(convenio.fechaPrimerPago)!,
    fechaProximoPago: DateUtil.formatForFrontend(convenio.fechaProximoPago),
    montoPagadoActual: Number(convenio.montoPagadoActual),
    motivo: convenio.motivo ?? null,
    fechaCreacion: DateUtil.formatForFrontend(convenio.createdAt)!,
    cuotas: convenio.cuotaConvenio
      ? convenio.cuotaConvenio.map(toInstallmentResponse)
      : undefined,
  };
}
