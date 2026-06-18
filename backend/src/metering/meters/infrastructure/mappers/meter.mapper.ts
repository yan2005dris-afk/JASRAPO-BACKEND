import { MeterEntity } from '../../domain/entities/meter.entity';

export class MeterMapper {
  static toDomain(raw: any): MeterEntity | null {
    if (!raw) return null;
    return new MeterEntity({
      medidorId: raw.medidorId,
      marca: raw.marca,
      modelo: raw.modelo,
      serie: raw.serie,
      estado: raw.estado,
      fechaInstalacion: raw.fechaInstalacion,
      fechaBaja: raw.fechaBaja,
      motivo: raw.motivo,
      latitud: raw.latitud ? Number(raw.latitud) : null,
      longitud: raw.longitud ? Number(raw.longitud) : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDomainList(rawList: any[]): MeterEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is MeterEntity => item !== null);
  }
}
