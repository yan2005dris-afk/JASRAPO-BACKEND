/**
 * Strategy contract for `SendReportByEmailUseCase`.
 *
 * Each report route (payments-report, connection-history, payment-agreement,
 * account-statement, clients-list) owns one strategy that knows:
 *   - how to derive the recipient email from the route's filters
 *   - how to build the email subject from the route's filters
 *
 * The `reportType` key MUST match the value used in `SendReportByEmailUseCase.execute({ reportType })`.
 *
 * Real implementations ship in PR 2. PR 1 ships the skeleton + 5 stub entries
 * so the use case can be exercised end-to-end before any strategy is finalised.
 */
export interface ReportEmailStrategy<TFilters = Record<string, unknown>> {
  readonly reportType: string;
  recipientResolver(filters: TFilters): Promise<string | null> | string | null;
  subjectBuilder(filters: TFilters): string;
}
