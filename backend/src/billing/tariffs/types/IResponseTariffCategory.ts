import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseTariffCategory {
  categoriaTarifaId: number;
  nombre: string;
  descripcion: string | null;
  valorBase: number;
  consumoMinimoMensual: number | null;
  valorExcedenteM3: number;
  fechaVigenciaDesde: Date | null;
  fechaVigenciaHasta: Date | null;
  activo: boolean;
}

export const safeTariffCategoriesSelect = {
  categoriaTarifaId: true,
  nombre: true,
  descripcion: true,
  valorBase: true,
  consumoMinimoMensual: true,
  valorExcedenteM3: true,
  fechaVigenciaDesde: true,
  fechaVigenciaHasta: true,
  activo: true,
} satisfies Prisma.CategoriaTarifaSelect;
