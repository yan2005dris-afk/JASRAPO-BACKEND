import { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import type { CategoriaTarifa, Rubros } from 'src/generated/prisma/client';
import type { EmbeddedRubro } from '../../domain/types/tariff.types';

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
    // El `select` del repo (safeTariffCategoriesSelect) no incluye relations
    // de Rubro (tarifaImpuesto), por lo que `raw.rubros` tiene solo los
    // campos planos del modelo Rubros. EmbeddedRubro los describe
    // exactamente asi (Prisma.RubrosGetPayload<{}> = sin hidratar relations).
    const rubros: EmbeddedRubro[] | undefined = Array.isArray(raw.rubros)
      ? raw.rubros
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
