import type { Prisma } from 'src/generated/prisma/client';

export interface TariffCategoryFilters {
  nombre?: string;
  /** Texto libre del buscador del listado: coincide con nombre o descripción. */
  search?: string;
  activo?: boolean;
}

export interface CreateTariffCategoryData {
  nombre: string;
  descripcion?: string | null;
  consumoMinimoMensual?: number | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}

export interface UpdateTariffCategoryData {
  nombre?: string;
  descripcion?: string | null;
  consumoMinimoMensual?: number | null;
  fechaVigenciaDesde?: Date | null;
  fechaVigenciaHasta?: Date | null;
  activo?: boolean;
}

/**
 * Shape de un Rubro tal como lo expone `TariffCategoryRepository` (un
 * subset de Prisma.Rubros sin hidratar relations como `tarifaImpuesto`).
 *
 * Definido en el BC `tariffs` para evitar que este BC dependa del BC
 * `rubros`. Cuando el PR de rubros migre ese BC al patron `RubroRow`,
 * este type se mantendra (la forma del row Prisma no cambia).
 */
export type EmbeddedRubro = Prisma.RubrosGetPayload<{}>;
