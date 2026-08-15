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
