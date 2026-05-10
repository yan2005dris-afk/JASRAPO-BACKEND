import { DateUtil } from 'src/infrastructure/common/util/date.util';
import type { ConvenioResponseDto } from '../dto/convenio-response.dto';
import type { CuotaConvenioResponseDto } from '../dto/cuota-convenio-response.dto';
import type { EstadoConvenioResponseDto } from '../dto/estado-convenio-response.dto';
import type { EstadoCuotaConvenioResponseDto } from '../dto/estado-cuota-convenio-response.dto';

/**
 * Mapea un resultado de Prisma EstadoConvenio al DTO de catálogo
 */
export function toEstadoConvenioResponse(e: any): EstadoConvenioResponseDto {
  return {
    estadoConvenioId: Number(e.estadoConvenioId),
    codigo: e.codigo,
    nombre: e.nombre,
    descripcion: e.descripcion ?? null,
    orden: Number(e.orden),
  };
}

/**
 * Mapea un resultado de Prisma EstadoCuotaConvenio al DTO de catálogo
 */
export function toEstadoCuotaConvenioResponse(
  e: any,
): EstadoCuotaConvenioResponseDto {
  return {
    estadoCuotaConvenioId: Number(e.estadoCuotaConvenioId),
    codigo: e.codigo,
    nombre: e.nombre,
    descripcion: e.descripcion ?? null,
    orden: Number(e.orden),
  };
}

/**
 * Mapea un resultado de Prisma CuotaConvenio al DTO de respuesta
 */
export function toCuotaConvenioResponse(cuota: any): CuotaConvenioResponseDto {
  return {
    cuotaConvenioId: String(cuota.cuotaConvenioId),
    convenioId: String(cuota.convenioId),
    numeroCuota: cuota.numeroCuota,
    valorCuota: Number(cuota.valorCuota),
    fechaVencimiento: DateUtil.formatForFrontend(cuota.fechaVencimiento)!,
    estado: {
      estadoCuotaConvenioId: Number(cuota.estado.estadoCuotaConvenioId),
      codigo: cuota.estado.codigo,
      nombre: cuota.estado.nombre,
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
export function toConvenioResponse(convenio: any): ConvenioResponseDto {
  return {
    convenioId: String(convenio.convenioId),
    contratoId: String(convenio.contratoId),
    numeroCuotas: convenio.numeroCuotas,
    abonoInicial: Number(convenio.abonoInicial),
    deudaTotal: Number(convenio.deudaTotal),
    diasMoraActual: convenio.diasMoraActual,
    estado: {
      estadoConvenioId: Number(convenio.estado.estadoConvenioId),
      codigo: convenio.estado.codigo,
      nombre: convenio.estado.nombre,
    },
    fechaAprobacion: DateUtil.formatForFrontend(convenio.fechaAprobacion),
    fechaPrimerPago: DateUtil.formatForFrontend(convenio.fechaPrimerPago)!,
    fechaProximoPago: DateUtil.formatForFrontend(convenio.fechaProximoPago),
    montoPagadoActual: Number(convenio.montoPagadoActual),
    motivo: convenio.motivo ?? null,
    fechaCreacion: DateUtil.formatForFrontend(convenio.createdAt)!,
    cuotas: convenio.cuotaConvenio
      ? convenio.cuotaConvenio.map(toCuotaConvenioResponse)
      : undefined,
  };
}
