/**
 * Especificación del Reporte (ReportSpec)
 *
 * Define un contrato para cada tipo de reporte, especificando:
 * - type: Un identificador único para el reporte
 * - fetchData: Un método para obtener y transformar datos crudos basados en filtros
 */
export interface ReportSpec<TFilters extends object = Record<string, unknown>> {
  readonly type: string;
  fetchData(filters: TFilters): Promise<Record<string, unknown>>;
}
