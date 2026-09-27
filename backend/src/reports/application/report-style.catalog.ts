import type { ReportKey, ReportStyle } from './report-style.service';

/**
 * ─── Report-style catalog (PDF-01) ──────────────────────────────────────────
 *
 * Single source of truth declaring **which styles each report family is
 * allowed to render with**. This is the "registry declares and validates the
 * allowed styles per report" required by PDF-01 (Yandris, 2026-08-19).
 *
 * Decision encoded here:
 *  - `legacy` / `modern` is an **opt-in, per-family** capability — used only
 *    where the product confirmed parallel designs.
 *  - Legal / contractual documents use **one canonical template** and ignore
 *    the global `reporte.estilo`. That modality is `unique` (canonical-only).
 *  - The dispatcher validates the resolved style against this catalog and
 *    never invents an unsupported variant.
 *
 * A report family is `unique` (canonical-only) when its allowed list is
 * exactly `['unique']`. Otherwise it is a dual-style family that resolves
 * `legacy` | `modern` from `sistema_config`.
 *
 * El catálogo, los tipos PDF registrados y las plantillas deben mantenerse
 * sincronizados para no publicar variantes sin respaldo del producto.
 */
export const REPORT_STYLE_CATALOG: Readonly<
  Record<ReportKey, readonly ReportStyle[]>
> = {
  'payments-report': ['legacy', 'modern'],
  'connection-history': ['legacy', 'modern'],
  'account-statement': ['legacy', 'modern'],
  'clients-list': ['legacy', 'modern'],
  'overdue-accounts': ['legacy', 'modern'],
  // PDF-11 (prototipo): dos diseños paralelos como el resto de reportes
  // administrativos, resueltos por `reporte.estilo`.
  'zone-consumption': ['legacy', 'modern'],
  // Legal/contractual → canonical-only. Global `reporte.estilo` is ignored.
  'payment-agreement': ['unique'],
};

/**
 * The styles a report family is allowed to render with. Never empty for a
 * known `ReportKey` (the union is closed and every key is declared above).
 */
export function getAllowedStyles(reportKey: ReportKey): readonly ReportStyle[] {
  return REPORT_STYLE_CATALOG[reportKey] ?? [];
}

/**
 * True when `style` is declared as allowed for `reportKey`.
 */
export function isStyleAllowed(
  reportKey: ReportKey,
  style: ReportStyle,
): boolean {
  return getAllowedStyles(reportKey).includes(style);
}

/**
 * True when the report family ships a single canonical template and ignores
 * the global `reporte.estilo` (its allowed list is exactly `['unique']`).
 */
export function isCanonicalOnly(reportKey: ReportKey): boolean {
  const allowed = getAllowedStyles(reportKey);
  return allowed.length === 1 && allowed[0] === 'unique';
}
