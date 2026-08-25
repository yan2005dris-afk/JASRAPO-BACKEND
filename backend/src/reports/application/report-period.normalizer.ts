import { DateUtil } from 'src/shared/utils/date.util';
import { fromZonedTime } from 'date-fns-tz';

export interface NormalizedReportDateRange {
  startInclusive?: Date;
  endExclusive?: Date;
}

/** Normalizes a selected date range as [startInclusive, endExclusive). */
export function normalizeReportDateRange(
  fechaDesde?: string,
  fechaHasta?: string,
  timeZone = 'America/Guayaquil',
): NormalizedReportDateRange {
  const startDate = fechaDesde
    ? DateUtil.parseFrontendDateStrict(fechaDesde)
    : undefined;
  const endDate = fechaHasta
    ? DateUtil.parseFrontendDateStrict(fechaHasta)
    : undefined;

  startDate?.setHours(0, 0, 0, 0);
  if (endDate) {
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
  }

  return {
    startInclusive: startDate ? fromZonedTime(startDate, timeZone) : undefined,
    endExclusive: endDate ? fromZonedTime(endDate, timeZone) : undefined,
  };
}

/** Resolves a date-only cutoff to the final instant in its requested zone. */
export function normalizeReportCutoff(
  fechaCorte: string,
  timeZone = 'America/Guayaquil',
): Date {
  const cutoff = DateUtil.parseFrontendDateStrict(fechaCorte);
  cutoff.setHours(23, 59, 59, 999);
  return fromZonedTime(cutoff, timeZone);
}
