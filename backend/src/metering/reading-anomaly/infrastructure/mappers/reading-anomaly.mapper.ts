import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

export class ReadingAnomalyMapper {
  static toDomain(raw: any): ReadingAnomalyEntity | null {
    if (!raw) return null;
    return new ReadingAnomalyEntity({
      anomaliaId: raw.anomaliaId,
      lecturaId: raw.lecturaId,
      observacion: raw.observacion,
      tipo: raw.tipo,
      estado: raw.estado,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      fotoUrl: raw.fotoUrl,
      lectura: raw.lectura
        ? {
            lecturaId: raw.lectura.lecturaId,
            fecha: raw.lectura.fecha,
            lecturaActual: Number(raw.lectura.lecturaActual),
            consumoCalculado: Number(raw.lectura.consumoCalculado),
          }
        : null,
    });
  }

  static toDomainList(rawList: any[]): ReadingAnomalyEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is ReadingAnomalyEntity => item !== null);
  }
}
