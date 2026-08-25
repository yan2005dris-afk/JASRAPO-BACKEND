import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';
import type {
  AuthorizedReportActor,
  ReportPeriodContext,
  ReportRequestContext,
  ReportType,
} from './models/report-request-context';
import {
  normalizeReportCutoff,
  normalizeReportDateRange,
} from './report-period.normalizer';

export const DEFAULT_REPORT_TIME_ZONE = 'America/Guayaquil';
export const DEFAULT_REPORT_LOCALE = 'es-EC';

export interface CreateReportRequestContextParams<TFilters extends object> {
  reportType: ReportType;
  actor: { usersId?: number; email?: string; rol?: string };
  filters: TFilters;
  timeZone?: string | string[];
  locale?: string | string[];
}

@Injectable()
export class ReportRequestContextFactory {
  create<TFilters extends object>(
    params: CreateReportRequestContextParams<TFilters>,
  ): ReportRequestContext<TFilters> {
    if (typeof params.actor.usersId !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const timeZone = this.normalizeTimeZone(params.timeZone);
    const locale = this.normalizeLocale(params.locale);
    const filters = this.applyTemporalDefaults(
      params.reportType,
      this.normalizeFilters(params.filters),
      timeZone,
    );
    const actor: AuthorizedReportActor = {
      userId: params.actor.usersId,
      ...(params.actor.email ? { email: params.actor.email } : {}),
      ...(params.actor.rol ? { role: params.actor.rol } : {}),
    };
    const identifiers = Object.fromEntries(
      Object.entries(filters)
        .filter(([key, value]) => key.endsWith('Id') && value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    const period = this.buildPeriod(filters, timeZone);

    return Object.freeze({
      reportType: params.reportType,
      actor: Object.freeze(actor),
      entity: Object.freeze({
        resource: params.reportType,
        identifiers: Object.freeze(identifiers),
      }),
      period: Object.freeze(period),
      timeZone,
      locale,
      filters: Object.freeze(filters),
    });
  }

  private normalizeFilters<TFilters extends object>(
    filters: TFilters,
  ): TFilters {
    const normalized = Object.entries(filters)
      .sort(([left], [right]) => left.localeCompare(right))
      .reduce<Record<string, unknown>>((result, [key, value]) => {
        if (value === undefined || value === null || value === '')
          return result;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) result[key] = trimmed;
          return result;
        }
        result[key] = value;
        return result;
      }, {});
    return normalized as TFilters;
  }

  private applyTemporalDefaults<TFilters extends object>(
    reportType: ReportType,
    filters: TFilters,
    timeZone: string,
  ): TFilters {
    if (reportType !== 'overdue-accounts' || 'fechaCorte' in filters) {
      return filters;
    }

    return {
      ...filters,
      fechaCorte: formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd'),
    };
  }

  private buildPeriod<TFilters extends object>(
    filters: TFilters,
    timeZone: string,
  ): ReportPeriodContext {
    const temporalFilters = filters as {
      fechaDesde?: string;
      fechaHasta?: string;
      fechaCorte?: string;
    };
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      temporalFilters.fechaDesde,
      temporalFilters.fechaHasta,
      timeZone,
    );
    const cutoffInclusive = temporalFilters.fechaCorte
      ? normalizeReportCutoff(temporalFilters.fechaCorte, timeZone)
      : undefined;

    return {
      from: temporalFilters.fechaDesde,
      to: temporalFilters.fechaHasta,
      cutoff: temporalFilters.fechaCorte,
      startInclusive,
      endExclusive,
      cutoffInclusive,
    };
  }

  private normalizeTimeZone(value?: string | string[]): string {
    const timeZone = this.firstHeaderValue(value) ?? DEFAULT_REPORT_TIME_ZONE;
    try {
      new Intl.DateTimeFormat(DEFAULT_REPORT_LOCALE, { timeZone }).format();
      return timeZone;
    } catch {
      throw new BadRequestException(`Invalid report time zone: ${timeZone}`);
    }
  }

  private normalizeLocale(value?: string | string[]): string {
    const locale =
      this.firstHeaderValue(value)?.split(',')[0]?.split(';')[0]?.trim() ||
      DEFAULT_REPORT_LOCALE;
    try {
      return Intl.getCanonicalLocales(locale)[0] ?? DEFAULT_REPORT_LOCALE;
    } catch {
      throw new BadRequestException(`Invalid report locale: ${locale}`);
    }
  }

  private firstHeaderValue(value?: string | string[]): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
