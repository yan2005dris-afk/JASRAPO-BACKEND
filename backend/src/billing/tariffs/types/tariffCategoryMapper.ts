import type { IResponseTariffCategory } from './IResponseTariffCategory';
import type { CategoriaTarifa } from 'src/generated/prisma/client';

/**
 * Tipo de entrada desde Prisma
 */
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
>;

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number donde sea necesario
 * Excluye campos internos: updatedAt, createdAt, deletedAt
 */
export function toTariffCategoryResponse(tariff: TariffCategoryPrismaRaw): IResponseTariffCategory {
  return {
    categoriaTarifaId: tariff.categoriaTarifaId,
    nombre: tariff.nombre,
    descripcion: tariff.descripcion,
    valorBase: Number(tariff.valorBase), // Convertir Decimal a number
    consumoMinimoMensual: tariff.consumoMinimoMensual,
    valorExcedenteM3: Number(tariff.valorExcedenteM3), // Convertir Decimal a number
    fechaVigenciaDesde: tariff.fechaVigenciaDesde,
    fechaVigenciaHasta: tariff.fechaVigenciaHasta,
    activo: tariff.activo,
  };
}
