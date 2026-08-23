import { Decimal } from 'decimal.js';
import { MeterHistoryEntity } from '../../domain/entities/meter-history.entity';

export class MeterHistoryMapper {
  static toDomain(raw: any): MeterHistoryEntity | null {
    if (!raw) return null;
    return new MeterHistoryEntity({
      historialId: raw.historialId,
      medidorId: raw.medidorId,
      serie: raw.medidor?.serie ?? '',
      marca: raw.medidor?.marca ?? '',
      modelo: raw.medidor?.modelo ?? '',
      contratoId: raw.contratoId,
      clienteNombre: raw.contrato?.cliente
        ? `${raw.contrato.cliente.nombres} ${raw.contrato.cliente.apellidos}`
        : null,
      fechaDesde: raw.fechaDesde,
      fechaHasta: raw.fechaHasta ?? null,
      lecturaInicial: new Decimal(raw.lecturaInicial?.toString() ?? '0'),
      lecturaFinal:
        raw.lecturaFinal != null
          ? new Decimal(raw.lecturaFinal.toString())
          : null,
      motivo: raw.motivo ?? null,
      observacion: raw.observacion ?? null,
      saldoPendienteCambio:
        raw.saldoPendienteCambio != null
          ? new Decimal(raw.saldoPendienteCambio.toString())
          : null,
      reemplazoSalienteId: raw.reemplazosSaliente?.reemplazoId ?? null,
      reemplazoEntranteId: raw.reemplazosEntrante?.reemplazoId ?? null,
    });
  }

  static toDomainList(rawList: any[]): MeterHistoryEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is MeterHistoryEntity => item !== null);
  }
}
