/**
 * Canonical `clave` strings for `sistema_config` rows used by the
 * reports dispatcher and any future consumer of the same keyspace.
 *
 * Use these constants instead of inline string literals to prevent
 * typo drift between the seed migration, the service consumers, and
 * any future tests or admin tooling.
 *
 * The shape of each value is the dot-segmented identifier stored in
 * the `clave` column; `as const` preserves the literal type so the
 * keyspace is discoverable from the type system.
 */
export const REPORTE_ESTILO_DEFAULT = 'reporte.estilo.default';
export const REPORTE_ESTILO_PAYMENTS_REPORT = 'reporte.estilo.payments-report';
export const REPORTE_ESTILO_CONNECTION_HISTORY =
  'reporte.estilo.connection-history';
export const REPORTE_ESTILO_PAYMENT_AGREEMENT =
  'reporte.estilo.payment-agreement';
