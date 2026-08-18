import { BatchEntity } from '../../domain/entities/batch.entity';
import { PreInvoiceMapper } from '../../../pre-invoice/infrastructure/mappers/pre-invoice.mapper';
import { Decimal } from 'decimal.js';

function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

export class BatchMapper {
  static toDomain(raw: any): BatchEntity | null {
    if (!raw) return null;

    return new BatchEntity({
      loteId: BigInt(raw.loteId),
      comunidadId: raw.comunidadId,
      periodoId: raw.periodoId,
      estado: raw.estado,
      totalMonto: toNumber(raw.totalMonto),
      notas: raw.notas ?? null,
      creadoPor: raw.creadoPor ?? null,
      totalEmisiones: raw.totalEmisiones ?? 0,
      mes: raw.mes ?? 1,
      rutaId: raw.rutaId ? BigInt(raw.rutaId) : null,
      ruta: raw.ruta
        ? {
            rutaId: BigInt(raw.ruta.rutaId),
            nombre: raw.ruta.nombre ?? null,
          }
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      comunidad: raw.comunidad
        ? {
            comunidadId: raw.comunidad.comunidadId,
            nombre: raw.comunidad.nombre,
          }
        : null,
      periodoRel: raw.periodoRel
        ? {
            periodoId: raw.periodoRel.periodoId,
            nombre: raw.periodoRel.nombre,
            fechaInicio: raw.periodoRel.fechaInicio ?? null,
            fechaFin: raw.periodoRel.fechaFin ?? null,
          }
        : null,
      prefacturas: Array.isArray(raw.prefacturas)
        ? PreInvoiceMapper.toDomainList(raw.prefacturas)
        : undefined,
    });
  }

  static toDomainList(rawList: any[]): BatchEntity[] {
    return rawList
      .map(BatchMapper.toDomain)
      .filter((e): e is BatchEntity => e !== null);
  }
}
