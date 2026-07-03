import { DateUtil } from 'src/infrastructure/common/utils/date.util';
import type { PaymentResponseDto } from '../../interfaces/dto/payment-response.dto';
import type { PaymentDetailResponseDto } from '../../interfaces/dto/payment-detail-response.dto';
import type { SaldoFavorResponseDto } from '../../interfaces/dto/saldo-favor-response.dto';

export function toPaymentDetailResponse(
  detalle: any,
): PaymentDetailResponseDto {
  return {
    detallePagoId: String(detalle.detallePagoId),
    pagoId: String(detalle.pagoId),
    comprobanteId: detalle.comprobanteId ? String(detalle.comprobanteId) : null,
    cuotaConvenioId: detalle.cuotaConvenioId
      ? String(detalle.cuotaConvenioId)
      : null,
    tipoPago: detalle.tipoPago,
    montoAbonado: Number(detalle.montoAbonado),
    formaPagoId: detalle.formaPagoId,
    referencia: detalle.referencia ?? null,
    fechaTransaccion: DateUtil.formatForFrontend(detalle.fechaTransaccion),
    fechaCreacion: DateUtil.formatForFrontend(detalle.createdAt)!,
    comprobante: detalle.comprobante
      ? {
          comprobanteId: String(detalle.comprobante.id),
          tipoComprobante: detalle.comprobante.tipoComprobante,
          secuencial: detalle.comprobante.secuencial,
          importeTotal: detalle.comprobante.importeTotal
            ? Number(detalle.comprobante.importeTotal)
            : null,
          estado: detalle.comprobante.estado,
        }
      : undefined,
  };
}

export function toSaldoFavorResponse(saldo: any): SaldoFavorResponseDto {
  return {
    saldoFavorId: String(saldo.saldoFavorId),
    clienteId: String(saldo.clienteId),
    pagoId: saldo.pagoId ? String(saldo.pagoId) : null,
    montoSaldo: Number(saldo.montoSaldo),
    tipoOrigen: saldo.tipoOrigen,
    disponibleParaAplicar: saldo.disponibleParaAplicar,
    fechaCreacion: DateUtil.formatForFrontend(saldo.createdAt)!,
  };
}

export function toPaymentResponse(pago: any): PaymentResponseDto {
  return {
    pagoId: String(pago.pagoId),
    clienteId: String(pago.clienteId),
    cajaId: pago.cajaId ? String(pago.cajaId) : null,
    banco: pago.banco ?? null,
    tarjetaCredito: pago.tarjetaCredito ?? null,
    comprobanteUrl: pago.comprobanteUrl ?? null,
    fechaPago: DateUtil.formatForFrontend(pago.fechaPago)!,
    montoTotalRecibido: Number(pago.montoTotalRecibido),
    numeroOperacion: pago.numeroOperacion ?? null,
    observaciones: pago.observaciones ?? null,
    referenciaBanco: pago.referenciaBanco ?? null,
    estadoPago: pago.estadoPago,
    creadoPor: pago.creadoPor,
    anuladoPor: pago.anuladoPor ?? null,
    fechaAnulacion: DateUtil.formatForFrontend(pago.fechaAnulacion),
    motivoAnulacion: pago.motivoAnulacion ?? null,
    fechaCreacion: DateUtil.formatForFrontend(pago.createdAt)!,
    fechaActualizacion: DateUtil.formatForFrontend(pago.updatedAt),
    detallePago: pago.detallePago
      ? pago.detallePago.map(toPaymentDetailResponse)
      : undefined,
    saldosFavor: pago.saldosFavor
      ? pago.saldosFavor.map(toSaldoFavorResponse)
      : undefined,
  };
}
