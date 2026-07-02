/**
 * Canonical `clave` strings for `sistema_config` rows used by the
 * reports dispatcher and any future consumer of the same keyspace.
 *
 * Use these constants instead of inline string literals to prevent
 * typo drift between the seed and the service consumers.
 *
 * The shape of each value is the dot-segmented identifier stored in
 * the `clave` column; `as const` preserves the literal type so the
 * keyspace is discoverable from the type system.
 *
 * Decision: one global `reporte.estilo` applies to every report. Per-report
 * overrides (e.g. "all modern except connection-history in legacy") are
 * NOT supported yet — introduce an explicit `reporte.estilo.overrides.<key>`
 * mechanism when a real use case shows up. YAGNI.
 */
export const REPORTE_ESTILO = 'reporte.estilo';