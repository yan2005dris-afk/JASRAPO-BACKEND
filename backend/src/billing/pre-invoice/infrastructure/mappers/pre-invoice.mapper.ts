import { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';
import { PreInvoiceDetailEntity } from '../../domain/entities/pre-invoice-detail.entity';
import { Decimal } from 'decimal.js';

function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

function toNullableNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

export class PreInvoiceMapper {
  static toDomainDetail(raw: any): PreInvoiceDetailEntity {
    return new PreInvoiceDetailEntity({
      prefacturaDetalleId: raw.prefacturaDetalleId,
      prefacturaId: BigInt(raw.prefacturaId),
      rubroId: raw.rubroId,
      descripcion: raw.descripcion,
      cantidad: raw.cantidad,
      precioUnitario: toNumber(raw.precioUnitario),
      subtotal: toNumber(raw.subtotal),
      iva: toNumber(raw.iva),
      total: toNumber(raw.total),
      descuento: toNumber(raw.descuento),
      tarifaImpuesto: toNumber(raw.tarifaImpuesto),
      codigoImpuestoSri: raw.codigoImpuestoSri ?? null,
      codigoPorcentajeSri: raw.codigoPorcentajeSri ?? null,
      rubroNombre: raw.rubro?.nombre ?? null,
    });
  }

  static toDomain(raw: any | null | undefined): PreInvoiceEntity | null {
    if (!raw) return null;

    return new PreInvoiceEntity({
      prefacturaId: BigInt(raw.prefacturaId),
      uuid: raw.uuid,
      contratoId: BigInt(raw.contratoId),
      loteId: raw.loteId ? BigInt(raw.loteId) : null,
      periodoId: raw.periodoId,
      puntoEmisionId: raw.puntoEmisionId,
      lecturaAnterior: toNullableNumber(raw.lecturaAnterior),
      lecturaActual: toNullableNumber(raw.lecturaActual),
      consumoM3: toNullableNumber(raw.consumoM3),
      subtotal: toNumber(raw.subtotal),
      iva: toNumber(raw.iva),
      descuentoTotal: toNumber(raw.descuentoTotal),
      totalPagar: toNumber(raw.totalPagar),
      deudaAnterior: toNumber(raw.deudaAnterior),
      saldoVencido: toNumber(raw.saldoVencido),
      abono: toNumber(raw.abono),
      saldoActual: toNumber(raw.saldoActual),
      mesesAtrasado: raw.meses_atrasado ?? 0,
      estado: raw.estado,
      aprobadaPor: raw.aprobadaPor ?? null,
      fechaAprobacion: raw.fechaAprobacion ?? null,
      motivoRechazo: raw.motivoRechazo ?? null,
      clienteDireccion: raw.clienteDireccion ?? null,
      clienteEmail: raw.clienteEmail ?? null,
      clienteIdentificacion: raw.clienteIdentificacion ?? null,
      clienteNombre: raw.clienteNombre ?? null,
      tarifaNombre: raw.tarifaNombre ?? null,
      tarifaValorBase: toNullableNumber(raw.tarifaValorBase),
      tarifaValorExcedente: toNullableNumber(raw.tarifaValorExcedente),
      lecturaId: raw.lecturaId ? BigInt(raw.lecturaId) : null,
      comprobanteId: raw.comprobanteId ? BigInt(raw.comprobanteId) : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      detalles: Array.isArray(raw.prefacturaDetalle)
        ? raw.prefacturaDetalle.map(PreInvoiceMapper.toDomainDetail)
        : undefined,
      contrato: raw.contrato
        ? {
            contratoId: BigInt(raw.contrato.contratoId),
            numeroGuia: raw.contrato.numeroGuia,
            cliente: raw.contrato.cliente
              ? {
                  clienteId: BigInt(raw.contrato.cliente.clienteId),
                  nombres: raw.contrato.cliente.nombres,
                  apellidos: raw.contrato.cliente.apellidos,
                  identificacion: raw.contrato.cliente.identificacion,
                  direccionDomicilio:
                    raw.contrato.cliente.direccionDomicilio ?? null,
                  email: raw.contrato.cliente.email ?? null,
                }
              : null,
          }
        : null,
      lote: raw.lote
        ? {
            loteId: BigInt(raw.lote.loteId),
            estado: raw.lote.estado ?? null,
            comunidad: raw.lote.comunidad
              ? { nombre: raw.lote.comunidad.nombre }
              : null,
          }
        : null,
      periodoRel: raw.periodoRel
        ? {
            nombre: raw.periodoRel.nombre,
            fechaInicio: raw.periodoRel.fechaInicio ?? null,
            fechaFin: raw.periodoRel.fechaFin ?? null,
          }
        : null,
      puntoEmision: raw.puntoEmision
        ? {
            id: raw.puntoEmision.id,
            codigo: raw.puntoEmision.codigo,
            establecimiento: raw.puntoEmision.establecimiento
              ? {
                  id: raw.puntoEmision.establecimiento.id,
                  codigo: raw.puntoEmision.establecimiento.codigo,
                  emisor: raw.puntoEmision.establecimiento.emisor
                    ? {
                        id: raw.puntoEmision.establecimiento.emisor.id,
                        ruc: raw.puntoEmision.establecimiento.emisor.ruc,
                        razonSocial:
                          raw.puntoEmision.establecimiento.emisor.razonSocial,
                      }
                    : null,
                }
              : null,
          }
        : null,
    });
  }

  static toDomainList(rawList: any[]): PreInvoiceEntity[] {
    return rawList
      .map(PreInvoiceMapper.toDomain)
      .filter((e): e is PreInvoiceEntity => e !== null);
  }
}
