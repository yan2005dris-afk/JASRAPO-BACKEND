import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import type { CategoriaTarifa } from 'src/generated/prisma/client';

export type TariffCategoryPrismaRaw = Pick<
  CategoriaTarifa,
  | 'categoriaTarifaId'
  | 'nombre'
  | 'descripcion'
  | 'valorBase'
  | 'consumoMinimoMensual'
  | 'valorExcedenteM3'
  | 'fechaVigenciaDesde'
  | 'fechaVigenciaHasta'
  | 'activo'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export class TariffCategoryMapper {
  static toDomain(raw: TariffCategoryPrismaRaw | null | undefined): TariffCategoryEntity | null {
    if (!raw) return null;
    return new TariffCategoryEntity({
      categoriaTarifaId: raw.categoriaTarifaId,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      valorBase: Number(raw.valorBase),
      consumoMinimoMensual: raw.consumoMinimoMensual,
      valorExcedenteM3: Number(raw.valorExcedenteM3),
      fechaVigenciaDesde: raw.fechaVigenciaDesde,
      fechaVigenciaHasta: raw.fechaVigenciaHasta,
      activo: raw.activo,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDomainList(rawList: TariffCategoryPrismaRaw[]): TariffCategoryEntity[] {
    return rawList
      .map((r) => TariffCategoryMapper.toDomain(r))
      .filter((e): e is TariffCategoryEntity => e !== null);
  }
}
