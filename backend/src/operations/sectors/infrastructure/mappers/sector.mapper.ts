import type { ComunidadRef } from '../../domain/entities/sector.entity';
import { SectorEntity } from '../../domain/entities/sector.entity';

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

    return new SectorEntity({
      sectorId: raw.sectorId,
      nombre: raw.nombre,
      codigo: raw.codigo,
      comunidadId: raw.comunidadId ?? null,
      comunidades: comunidades,
      deletedAt: raw.deletedAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toDomainList(raws: PrismaSectorRaw[]): SectorEntity[] {
    return raws.map(SectorMapper.toDomain);
  }
}
