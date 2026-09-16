# ADR-006: Separate contract service lifecycle from collection status

- **Status:** Accepted
- **Date:** 2026-09-13

## Context

`Contratos.estado` currently mixes the operational state of the water service with collection concerns such as mora and payment agreements. That makes an agreement look like a service lifecycle state and prevents the domain from expressing that a customer can pay an agreed debt while service remains active.

## Decision

Add two persisted fields while retaining `Contratos.estado` as a compatibility bridge:

- `estadoServicio`: `PENDIENTE_PAGO -> PENDIENTE_INSTALACION -> ACTIVO -> SUSPENDIDO -> RETIRADO`.
- `estadoCobranza`: `NO_APLICA` while service activation is pending, `AL_DIA` for active service without current-service mora, or `EN_MORA` when the configured current-service threshold is reached.
- `tieneConvenioActivo`: a derived read-model flag from active `Convenios`; it is
  metadata/protection and never a collection status.

`RETIRADO` is terminal. Completing installation activates a service. Reconnection activates service only after a completed reconnection work order; a payment or agreement alone never reactivates it. The legacy `Contratos.estado = EN_CONVENIO` remains supported temporarily, but convenio is separate and must never be shown or repopulated as `estadoCobranza`.

The migration is additive and supplies defaults. The domain mapper reads the new fields when present and projects legacy `estado` when older callers omit them. This compatibility slice dual-writes all three contract state fields, makes explicit separated fields authoritative, and migrates unambiguous payment, installation, filtering, and stored-procedure decisions. Legacy `estado` filters/catalog/response remain deprecated compatibility surfaces.

## Consequences

- New domain code can reason about service and collection independently.
- Existing callers and the legacy column remain build-compatible during the chained migration.
- Defaults do not rewrite historical `estado` values; later work units must migrate writes and reads deliberately.

## Follow-up work

1. Migrate remaining payment and agreement handlers to `estadoCobranza` without changing service lifecycle implicitly.
2. Migrate remaining installation and reconnection work-order completion flows to `estadoServicio`.
3. Audit remaining operator/public response ports and route/reading consumers for additive separated-state fields.
4. Define authoritative historical convenio-debt allocation and resolve payment/evaluator race semantics.
5. A later final PR may remove `Contratos.estado` and `EstadoContrato.EN_CONVENIO` only after all consumers, seeds, SQL procedures, and external clients have migrated; this PR deliberately does not remove either symbol.
