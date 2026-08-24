import type { ReportKey } from '../report-style.service';

export type ReportType = ReportKey | 'overdue-accounts';

export interface AuthorizedReportActor {
  userId: number;
  email?: string;
  role?: string;
}

export interface ReportEntityContext {
  resource: ReportType;
  identifiers: Readonly<Record<string, string>>;
}

export interface ReportPeriodContext {
  from?: string;
  to?: string;
  cutoff?: string;
  startInclusive?: Date;
  endExclusive?: Date;
  cutoffInclusive?: Date;
}

export interface ReportRequestContext<TFilters extends object = object> {
  reportType: ReportType;
  actor: Readonly<AuthorizedReportActor>;
  entity: Readonly<ReportEntityContext>;
  period: Readonly<ReportPeriodContext>;
  timeZone: string;
  locale: string;
  filters: Readonly<TFilters>;
}

export interface ReportRequestContextSummary<TFilters extends object = object> {
  reportType: ReportType;
  actorId: number;
  entity: Readonly<ReportEntityContext>;
  period: Readonly<Pick<ReportPeriodContext, 'from' | 'to' | 'cutoff'>>;
  timeZone: string;
  locale: string;
  filters: Readonly<TFilters>;
}

export function summarizeReportRequestContext<TFilters extends object>(
  context: ReportRequestContext<TFilters>,
): ReportRequestContextSummary<TFilters> {
  return {
    reportType: context.reportType,
    actorId: context.actor.userId,
    entity: context.entity,
    period: {
      from: context.period.from,
      to: context.period.to,
      cutoff: context.period.cutoff,
    },
    timeZone: context.timeZone,
    locale: context.locale,
    filters: context.filters,
  };
}
