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

/**
 * SRI emission mode toggle consumed by `SriEmisionModeService`.
 *
 * Values:
 *   - `'automatico'` (default) — `SRIEmissionDispatcherService.tryEmit()` sends
 *     comprobantes immediately. Current behavior.
 *   - `'manual'` — `tryEmit()` parks comprobantes in `ComprobanteEstado.POR_EMITIR`.
 *     Operators trigger emission via `POST /sri/comprobantes/:claveAcceso/emitir-manual`.
 *
 * Unknown values (typo, manual edit) fall back to `'automatico'` with a warn
 * log + an `AuditoriaSri` row (`accion='modo-invalido-fallback'`).
 * See `sdd/sri-emision-modo-manual-automatico`.
 */
export const SRI_EMISION_MODO = 'sri.emision.modo';

/**
 * Base URL for frontend client applications, used in notification and invitation emails.
 *
 * Fallback hierarchy in consumers (e.g. `MailService`):
 *   1. `sistema_config` (clave `FRONTEND_URL`)
 *   2. `process.env.APP_URL`
 *   3. `http://localhost:4200`
 */
export const FRONTEND_URL = 'FRONTEND_URL';
