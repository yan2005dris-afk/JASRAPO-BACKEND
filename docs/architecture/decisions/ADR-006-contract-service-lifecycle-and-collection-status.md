# ADR-006: Separate contract service lifecycle from collection status

- **Status:** Accepted
- **Date:** 2026-09-13

## Context

`Contratos.estado` currently mixes the operational state of the water service with collection concerns such as mora and payment agreements. That makes an agreement look like a service lifecycle state and prevents the domain from expressing that a customer can pay an agreed debt while service remains active.

## Decision

Use two persisted fields and remove `Contratos.estado` after the staged rollout:

- `estadoServicio`: `PENDIENTE_PAGO -> PENDIENTE_INSTALACION -> ACTIVO -> SUSPENDIDO -> RETIRADO`.
- `estadoCobranza`: `NO_APLICA` while service activation is pending, `AL_DIA` for active service without current-service mora, or `EN_MORA` when the configured current-service threshold is reached.
- `tieneConvenioActivo`: a derived read-model flag from active `Convenios`; it is
  metadata/protection and never a collection status.

`RETIRADO` is terminal. Completing installation activates a service. Reconnection activates service only after a completed reconnection work order; a payment or agreement alone never reactivates it. The legacy `Contratos.estado = EN_CONVENIO` remains supported temporarily, but convenio is separate and must never be shown or repopulated as `estadoCobranza`.

The migration is additive and supplies defaults. The final cutover removes the legacy column and enum; contract DTOs, mappers, repositories, operator responses, and stored procedures use only the separated fields. Legacy API state input/output is not retained because the coordinated frontend no longer sends or reads it.

## Consequences

- New domain code can reason about service and collection independently.
- The frontend deployment must follow the backend consumer-migration release and precede this final schema-removal migration.
- Defaults do not rewrite historical `estado` values; later work units must migrate writes and reads deliberately.

## Follow-up work

1. Deploy the backend consumer migration (PR #290) first.
2. Deploy frontend PR #119 (commit `44a2dbe`) so clients stop sending and reading legacy `estado`.
3. Deploy this final backend cutover, including the schema migration that replaces installed routines and drops `Contratos.estado` and `EstadoContrato`.
