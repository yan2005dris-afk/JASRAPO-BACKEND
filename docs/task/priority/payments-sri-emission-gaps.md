# Payments ↔ SRI — Brechas en la cadena de emisión

Detectadas durante la review del PR `jean.cedenoandrade/sc-130/fix-estabilizacion-endpoints`
(post-merge del módulo de pagos + integración SRI via outbox).

## Contexto

Hoy la emisión SRI de un comprobante se gatilla asíncronamente desde el outbox
cuando un pago normal pasa de `PENDIENTE` a `REGISTRADO`:

```
PATCH /payments/:id/state (PENDIENTE → REGISTRADO)
  └─ ValidatePaymentUseCase (misma tx)
       ├─ updateManyPagos (REGISTRADO)
       └─ eventos_pendientes.insert('pago.validado', { pagoId })

OutboxProcessor (poll cada 5s)
  └─ PagoValidadoHandler.procesarPagoValidado(pagoId)
       └─ Suma todos los DetallePago del comprobante (multi-pago)
            └─ Si totalAbonado ≥ importeTotal y comprobante está BORRADOR
                 └─ optimistic lock BORRADOR → ENVIANDO
                      └─ jobsService.send('sri-emision', FACTURA_DESDE_PREFACTURA)
```

`ApplySaldoFavorUseCase` crea un `Pago` con `estadoPago = REGISTRADO` directamente
(no pasa por la máquina de estados) y por eso **no emite el outbox event**, dejando
la emisión SRI sin disparar.

## Brechas

### G1 — Aplicación de saldo a favor a comprobante no dispara emisión SRI [CRITICAL]

**Síntoma**: si un cliente aplica saldo a favor que cubre (o excede) el
`importeTotal` de un comprobante, el comprobante queda en `BORRADOR` y nunca se
encola `sri-emision`. La factura nunca sale al SRI.

**Pasos para reproducir**:

1. Crear prefactura con comprobante en BORRADOR con `importeTotal = 100`.
2. Registrar pago normal de 50 (`POST /payments`) → PENDIENTE.
3. Validar pago (`PATCH /payments/:id/state` a REGISTRADO).
4. Outbox dispara `pago.validado`. `totalAbonado=50 < 100`, no emite. Correcto.
5. Generar saldo a favor de 50 (ej. un pago libre que exceda).
6. `POST /payments/apply-saldo-favor` con `comprobanteId` y `montoAplicar=50`.
7. **Esperado**: comprobante pasa a ENVIANDO, se encola `sri-emision`.
8. **Actual**: comprobante queda en BORRADOR, no hay evento, no hay job.

**Por qué pasa**:

- `ApplySaldoFavorUseCase.execute()` llama `createPago({ estadoPago: REGISTRADO })`
  y `createDetallePago({ tipoPago: SALDO_FAVOR, comprobanteId })` sin emitir
  `eventos_pendientes`.
- `PagoValidadoHandler` solo se invoca desde el OutboxProcessor, que solo
  se alimenta de filas tipo `pago.validado`. Sin evento, no llega.

**Archivos afectados**:

- `backend/src/billing/collections/payments/application/use-cases/apply-saldo-favor.use-case.ts`
- `backend/src/billing/collections/payments/application/use-cases/apply-saldo-favor.use-case.spec.ts`
- `backend/src/billing/collections/payments/payments.module.ts` (proveer `EventosPendientesRepository`)

**Tarea**:

### T-G1 · Disparar `pago.validado` desde `ApplySaldoFavorUseCase` cuando hay `comprobanteId`

**Archivos**:

- `backend/src/billing/collections/payments/application/use-cases/apply-saldo-favor.use-case.ts`
- `backend/src/billing/collections/payments/application/use-cases/apply-saldo-favor.use-case.spec.ts`
- `backend/src/billing/collections/payments/payments.module.ts`

**Pasos**:

1. Inyectar `EventosPendientesRepository` en `ApplySaldoFavorUseCase`.
2. Dentro de la `executeTransaction` actual, **después** de crear el `Pago`
   y el `DetallePago`, emitir `eventosPendientesRepository.createPending(
     'pago.validado', { pagoId: pago.pagoId.toString(), estadoPago: 'REGISTRADO' },
     'PAGO', pago.pagoId.toString(), tx)`
   **solo si** `dto.comprobanteId` está presente.
3. Reusar `PagoValidadoHandler` (no tocar): ya cubre BORRADOR + optimistic lock + multi-pago.
4. Test nuevo en `apply-saldo-favor.use-case.spec.ts`:
   - saldo que cubre exactamente `importeTotal` → `eventosPendientes.createPending` llamado 1 vez con tipo `pago.validado`.
   - saldo que no cubre → no se llama (handler evaluará después).
   - saldo aplicado a `cuotaConvenioId` (no `comprobanteId`) → no se llama (queda para T-G2).

**Criterio de aceptación**:

- Tras `apply-saldo-favor` con `comprobanteId` y monto suficiente, el
  `Comprobantes.estado` transiciona `BORRADOR → ENVIANDO` (vía outbox handler).
- Test cubre happy path y el caso "monto no alcanza".
- Sin re-implementación de la lógica de emisión: `PagoValidadoHandler` es la
  única fuente de verdad.

**Prioridad**: alta — bug funcional en flujo de saldo a favor.

---

### G2 — Aplicación de saldo a favor a cuota no propaga al comprobante de prefactura [MEDIUM]

**Síntoma**: si todas las cuotas de una prefactura se pagan (mix de pagos
normales y saldos a favor), la prefactura genera un comprobante BORRADOR que
nunca transiciona a ENVIANDO, porque `ApplySaldoFavorUseCase` (con
`cuotaConvenioId`) deja `DetallePago.comprobanteId = null` y el handler de
outbox solo dispara sobre `DetallePago.comprobanteId ≠ null`.

**Modelo de datos relevante**:

```
Prefacturas ──┬── Comprobantes (1:1 via comprobanteId, estado=BORRADOR)
              └── PrefacturaDetalle.cuotaConvenioId ──► CuotaConvenio

CuotaConvenio ──► DetallePago (cuotaConvenioId, tipoPago: CUOTA_CONVENIO o SALDO_FAVOR)
```

**Por qué pasa**:

- `PagoValidadoHandler.procesarPagoValidado()` arranca leyendo
  `DetallePago` por `pagoId`, colecta `comprobanteIds` y los despacha. Si el
  DetallePago tiene `comprobanteId = null`, se ignora.
- No existe ningún listener para "todas las cuotas PAGADA → emitir comprobante
  de la prefactura".

**Archivos afectados**:

- `backend/src/billing/collections/payments/application/use-cases/apply-saldo-favor.use-case.ts`
- `backend/src/billing/collections/payments/application/use-cases/create-payment.use-case.ts`
  (mismo gap existe al pagar con `tipoPago=CUOTA_CONVENIO` y completar la prefactura)
- `backend/src/billing/collections/payments/application/pago-validado.handler.ts`
  (extender para soportar derivación desde cuota)

**Tarea**:

### T-G2 · Propagar emisión SRI cuando se completa una prefactura por cuota

**Sub-tareas**:

1. **Sub-G2a — Definir evento `cuota.pagada`** en `EventosPendientes`
   (mismo outbox). Payload: `{ cuotaConvenioId, pagoId, convenioId }`.
2. **Sub-G2b — Disparar** desde `CreatePaymentUseCase.applyInstallmentPayment`
   cuando `estaPagada === true`, y desde `ApplySaldoFavorUseCase` cuando
   `dto.cuotaConvenioId` y el resultado paga la cuota. Mismo `executeTransaction`,
   misma atomicidad.
3. **Sub-G2c — Nuevo handler `CuotaPagadaHandler`**:
   - Lee `PrefacturaDetalle` con `cuotaConvenioId`.
   - Para cada `PrefacturaDetalle.prefacturaId`, trae el `Comprobantes`
     asociado.
   - Verifica que **todas** las cuotas `PrefacturaDetalle.cuotaConvenioId`
     de esa prefactura estén `PAGADA`.
   - Si sí y el comprobante está en BORRADOR → `updateEstadoWithLock
     (BORRADOR → ENVIANDO)` y `jobsService.send('sri-emision', FACTURA_DESDE_PREFACTURA)`.
4. **Sub-G2d — Registrar handler en `OutboxProcessor`** desde un nuevo módulo
   o desde `agreements/` (la prefactura es de acuerdos). Ver
   `docs/task/priority/payments-sri-emission-gaps.md` nota "Origen del evento".

**Criterio de aceptación**:

- Pago normal o saldo a favor que pague la última cuota pendiente de una
  prefactura → la prefactura emite su comprobante al SRI.
- Si dos cuotas distintas de prefacturas distintas se pagan en la misma
  tx, se generan dos eventos `cuota.pagada` independientes.
- Tests E2E por tipo de detalle (`CUOTA_CONVENIO` y `SALDO_FAVOR` con `cuotaConvenioId`).

**Prioridad**: media — gap latente; depende de si el módulo de prefacturas
genera comprobantes hoy o después de T-G1.

---

## Anexo — Origen del evento `cuota.pagada`

La prefactura y su comprobante están en `billing/collections/agreements/`
y/o en `billing/collections/prefacturas/` (verificar al ejecutar G2).
Dos opciones de dónde registrar el handler:

- **A)** En `payments.module.ts` (centraliza toda la cadena). Riesgo: coupling
  entre dominios.
- **B)** En el módulo dueño del agregado `Prefactura`. Mejor cohesión,
  requiere inyectar `EventosPendientesRepository` ahí.

Decidir al tomar T-G2; revisar con el owner de `agreements`.

---

## Resumen

| ID    | Severidad | Síntoma                                              | Archivo raíz                                   |
|-------|-----------|------------------------------------------------------|------------------------------------------------|
| G1    | Critical  | Saldo a favor a comprobante no emite SRI              | `apply-saldo-favor.use-case.ts`                |
| G2    | Medium    | Cuota de prefactura pagada no propaga a comprobante  | `apply-saldo-favor.use-case.ts` + `create-payment.use-case.ts` + `pago-validado.handler.ts` |

G1 es bloqueante para aceptar el módulo en producción. G2 puede resolverse
en un PR de seguimiento.

---

## Dependencias externas (sin cambios)

| Dependencia       | Estado     | Notas                                |
|-------------------|------------|--------------------------------------|
| `EventosPendientesRepository` | ✅ existe | Reusable, ya inyectado en `ValidatePaymentUseCase` |
| `OutboxProcessor`             | ✅ existe | Poll cada 5s, batch 10               |
| `PagoValidadoHandler`         | ✅ existe | Lógica BORRADOR + lock + SRI_EMISION_JOB |
| `sri-emision` (pg-boss job)   | ✅ existe | Worker separado fuera de payments    |
