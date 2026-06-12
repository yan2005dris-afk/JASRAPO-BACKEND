import { SectorEntity, ComunidadRef } from '../../domain/entities/sector.entity';

interface PrismaSectorRaw {
  sectorId: number;
  nombre: string;
  codigo: string;
  comunidadId: number | null;
  comunidades?: { comunidadId: number; codigo: string; nombre: string } | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SectorMapper {
  static toDomain(raw: PrismaSectorRaw): SectorEntity {
    let comunidades: ComunidadRef | null | undefined = undefined;

    if ('comunidades' in raw && raw.comunidades !== undefined) {
      comunidades = raw.comunidades
        ? {
            comunidadId: raw.comunidades.comunidadId,
            codigo: raw.comunidades.codigo,
            nombre: raw.comunidades.nombre,
          }
        : null;
    }

    return new SectorEntity(
      raw.sectorId,
      raw.nombre,
      raw.codigo,
      raw.comunidadId ?? null,
      comunidades,
      raw.deletedAt ?? null,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toDomainList(raws: PrismaSectorRaw[]): SectorEntity[] {
    return raws.map(SectorMapper.toDomain);
  }
}
