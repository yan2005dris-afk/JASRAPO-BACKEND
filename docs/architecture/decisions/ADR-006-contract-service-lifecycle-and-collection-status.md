# ADR-006: Separate contract service lifecycle from collection status

- **Status:** Accepted
- **Date:** 2026-09-13

## Context

`Contratos.estado` currently mixes the operational state of the water service with collection concerns such as mora and payment agreements. That makes an agreement look like a service lifecycle state and prevents the domain from expressing that a customer can pay an agreed debt while service remains active.

## Decision

Use two persisted fields and remove `Contratos.estado` after the staged rollout:

- `estadoServicio`: `PENDIENTE_INSPECCION -> PENDIENTE_PAGO -> PENDIENTE_INSTALACION -> ACTIVO -> SUSPENDIDO -> RETIRADO`. Una inspección no factible termina en `RECHAZADO`.
- `estadoCobranza`: `NO_APLICA` while service activation is pending, `AL_DIA` for active service without current-service mora, or `EN_MORA` when the configured current-service threshold is reached.
- `tieneConvenioActivo`: a derived read-model flag from active `Convenios`; it is
  metadata/protection and never a collection status.

`RETIRADO` is terminal. Completing installation activates a service. Reconnection activates service only after a completed reconnection work order; a payment or agreement alone never reactivates it. The legacy `Contratos.estado = EN_CONVENIO` remains supported temporarily, but convenio is separate and must never be shown or repopulated as `estadoCobranza`.

The migration is additive and supplies defaults. The final cutover removes the legacy column and enum; contract DTOs, mappers, repositories, operator responses, and stored procedures use only the separated fields. Legacy API state input/output is not retained because the coordinated frontend no longer sends or reads it.

## Consequences

### Actualización SC-321 (2026-09-25)

La creación reserva un medidor de `BODEGA` a `PENDIENTE` y genera una orden de inspección en la misma transacción, sin prefactura. Al completar la inspección se genera el cobro de instalación; al cancelarla se rechaza el contrato, se cierra el vínculo y el medidor vuelve a bodega. `RECHAZADO` es terminal y conserva `NO_APLICA`.

El pago completo genera una orden de instalación pendiente. Las órdenes automáticas se crean en rutas sin operario, con el período abierto si existe, y pueden asignarse después sin duplicar la orden. Los cierres y el pago bloquean el contrato para serializar reintentos. El formulario de edición no puede adelantar estas etapas. Las migraciones añaden los estados y cambian el valor predeterminado sin modificar contratos históricos.

- New domain code can reason about service and collection independently.
- The frontend deployment must follow the backend consumer-migration release and precede this final schema-removal migration.
- Defaults do not rewrite historical `estado` values; later work units must migrate writes and reads deliberately.

## Follow-up work

1. Deploy the backend consumer migration (PR #290) first.
2. Deploy frontend PR #119 (commit `44a2dbe`) so clients stop sending and reading legacy `estado`.
3. Deploy this final backend cutover, including the schema migration that replaces installed routines and drops `Contratos.estado` and `EstadoContrato`.
