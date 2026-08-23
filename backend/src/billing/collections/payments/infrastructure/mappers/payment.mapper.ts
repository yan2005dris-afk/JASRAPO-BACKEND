import { PaymentEntity } from '../../domain/entities/payment.entity';
import { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';
import { SaldoFavorEntity } from '../../domain/entities/saldo-favor.entity';
import { Decimal } from 'decimal.js';

function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

export class PaymentMapper {
  static toDomainDetail(raw: any): PaymentDetailEntity {
    return new PaymentDetailEntity({
      detallePagoId: BigInt(raw.detallePagoId),
      pagoId: BigInt(raw.pagoId),
      comprobanteId: raw.comprobanteId ? BigInt(raw.comprobanteId) : null,
      cuotaConvenioId: raw.cuotaConvenioId ? BigInt(raw.cuotaConvenioId) : null,
      tipoPago: raw.tipoPago,
      montoAbonado: toNumber(raw.montoAbonado),
      formaPagoId: raw.formaPagoId,
      referencia: raw.referencia ?? null,
      fechaTransaccion: raw.fechaTransaccion ?? null,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt ?? null,
      comprobante: raw.comprobante
        ? {
            comprobanteId: String(raw.comprobante.id),
            tipoComprobante: raw.comprobante.tipoComprobante,
            secuencial: raw.comprobante.secuencial,
            importeTotal: raw.comprobante.importeTotal
              ? toNumber(raw.comprobante.importeTotal)
              : null,
            estado: raw.comprobante.estado,
            prefactura: raw.comprobante.prefactura
              ? {
                  prefacturaId: String(raw.comprobante.prefactura.prefacturaId),
                  mes: raw.comprobante.prefactura.mes,
                  totalPagar: toNumber(raw.comprobante.prefactura.totalPagar),
                  consumoM3: raw.comprobante.prefactura.consumoM3
                    ? toNumber(raw.comprobante.prefactura.consumoM3)
                    : null,
                  periodoNombre: raw.comprobante.prefactura.periodoRel?.nombre,
                }
              : undefined,
          }
        : undefined,
    });
  }

  static toDomainDetailList(rawList: any[]): PaymentDetailEntity[] {
    return rawList.map(PaymentMapper.toDomainDetail);
  }

  static toDomainSaldoFavor(raw: any): SaldoFavorEntity {
    return new SaldoFavorEntity({
      saldoFavorId: BigInt(raw.saldoFavorId),
      clienteId: BigInt(raw.clienteId),
      pagoId: raw.pagoId ? BigInt(raw.pagoId) : null,
      montoSaldo: toNumber(raw.montoSaldo),
      tipoOrigen: raw.tipoOrigen,
      disponibleParaAplicar: Boolean(raw.disponibleParaAplicar),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
    });
  }

  static toDomainSaldoFavorList(rawList: any[]): SaldoFavorEntity[] {
    return rawList.map(PaymentMapper.toDomainSaldoFavor);
  }

  static toDomain(raw: any): PaymentEntity | null {
    if (!raw) return null;

    return new PaymentEntity({
      pagoId: BigInt(raw.pagoId),
      clienteId: BigInt(raw.clienteId),
      cajaId: raw.cajaId ? BigInt(raw.cajaId) : null,
      banco: raw.banco ?? null,
      tarjetaCredito: raw.tarjetaCredito ?? null,
      comprobanteUrl: raw.comprobanteUrl ?? null,
      fechaPago: raw.fechaPago,
      montoTotalRecibido: toNumber(raw.montoTotalRecibido),
      numeroOperacion: raw.numeroOperacion ?? null,
      observaciones: raw.observaciones ?? null,
      referenciaBanco: raw.referenciaBanco ?? null,
      estadoPago: raw.estadoPago,
      creadoPor: raw.creadoPor,
      anuladoPor: raw.anuladoPor ?? null,
      fechaAnulacion: raw.fechaAnulacion ?? null,
      motivoAnulacion: raw.motivoAnulacion ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      detallePago: Array.isArray(raw.detallePago)
        ? raw.detallePago.map(PaymentMapper.toDomainDetail)
        : undefined,
      saldosFavor: Array.isArray(raw.saldosFavor)
        ? raw.saldosFavor.map(PaymentMapper.toDomainSaldoFavor)
        : undefined,
      cliente: raw.cliente
        ? {
            clienteId: BigInt(raw.cliente.clienteId),
            nombres: raw.cliente.nombres,
            apellidos: raw.cliente.apellidos,
            razonSocial: raw.cliente.razonSocial ?? null,
            identificacion: raw.cliente.identificacion,
            email: raw.cliente.email ?? null,
            telefono: raw.cliente.telefono ?? null,
            direccionDomicilio: raw.cliente.direccionDomicilio ?? null,
          }
        : undefined,
    });
  }

  static toDomainList(rawList: any[]): PaymentEntity[] {
    return rawList
      .map(PaymentMapper.toDomain)
      .filter((e): e is PaymentEntity => e !== null);
  }
}
