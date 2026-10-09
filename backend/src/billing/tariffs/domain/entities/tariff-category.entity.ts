import type { EmbeddedRubro } from '../types/tariff.types';

export class TariffCategoryEntity {
  categoriaTarifaId: number;
  nombre: string;
  descripcion: string | null;
  consumoMinimoMensual: number | null;
  fechaVigenciaDesde: Date | null;
  fechaVigenciaHasta: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  rubros?: EmbeddedRubro[];

  constructor(partial: Partial<TariffCategoryEntity>) {
    Object.assign(this, partial);
  }
}
