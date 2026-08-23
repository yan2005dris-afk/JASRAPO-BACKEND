import { DateUtil } from 'src/shared/utils/date.util';

export interface NormalizedReportDateRange {
  startInclusive?: Date;
  endExclusive?: Date;
}

/**
 * Normaliza las fechas del reporte para trabajar con días completos.
 *
 * El límite final se coloca en la medianoche del día siguiente y no se
 * incluye. Así se consideran todos los registros del día seleccionado sin
 * depender de la precisión de fechas de la base de datos.
 */
export function normalizeReportDateRange(
  fechaDesde?: string,
  fechaHasta?: string,
): NormalizedReportDateRange {
  const startInclusive = fechaDesde
    ? DateUtil.parseFrontendDateStrict(fechaDesde)
    : undefined;
  const endExclusive = fechaHasta
    ? DateUtil.parseFrontendDateStrict(fechaHasta)
    : undefined;

  startInclusive?.setHours(0, 0, 0, 0);
  if (endExclusive) {
    endExclusive.setHours(0, 0, 0, 0);
    endExclusive.setDate(endExclusive.getDate() + 1);
  }

  return { startInclusive, endExclusive };
}
