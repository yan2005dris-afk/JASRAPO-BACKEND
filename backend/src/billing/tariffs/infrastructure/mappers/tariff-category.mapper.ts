import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { RubroMapper } from '../../../rubros/infrastructure/mappers/rubro.mapper';
import type { CategoriaTarifa, Rubros } from 'src/generated/prisma/client';

export type TariffCategoryPrismaRaw = Pick<
  CategoriaTarifa,
  | 'categoriaTarifaId'
  | 'nombre'
  | 'descripcion'
  | 'consumoMinimoMensual'
  | 'fechaVigenciaDesde'
  | 'fechaVigenciaHasta'
  | 'activo'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> & {
  rubros?: Rubros[];
};

export class TariffCategoryMapper {
  static toDomain(
    raw: TariffCategoryPrismaRaw | null | undefined,
  ): TariffCategoryEntity | null {
    if (!raw) return null;
    const rubros = Array.isArray(raw.rubros)
      ? RubroMapper.toDomainList(
          raw.rubros.map((r) => ({
            ...r,
            tarifaImpuesto: null,
          })),
        )
      : undefined;
    return new TariffCategoryEntity({
      categoriaTarifaId: raw.categoriaTarifaId,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      consumoMinimoMensual: raw.consumoMinimoMensual,
      fechaVigenciaDesde: raw.fechaVigenciaDesde,
      fechaVigenciaHasta: raw.fechaVigenciaHasta,
      activo: raw.activo,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      rubros,
    });
  }

  static toDomainList(
    rawList: TariffCategoryPrismaRaw[],
  ): TariffCategoryEntity[] {
    return rawList
      .map((r) => TariffCategoryMapper.toDomain(r))
      .filter((e): e is TariffCategoryEntity => e !== null);
  }
}
