export class TariffCategoryEntity {
  categoriaTarifaId: number;
  nombre: string;
  descripcion: string | null;
  valorBase: number;
  consumoMinimoMensual: number | null;
  valorExcedenteM3: number;
  fechaVigenciaDesde: Date | null;
  fechaVigenciaHasta: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<TariffCategoryEntity>) {
    Object.assign(this, partial);
  }
}
