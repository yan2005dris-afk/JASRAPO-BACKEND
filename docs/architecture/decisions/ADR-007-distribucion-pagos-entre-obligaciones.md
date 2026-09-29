# ADR-007: Distribución de Pagos entre Múltiples Obligaciones Cobrables

- **Estado:** Aceptado
- **Fecha:** 2026-09-24
- **Autores / Decisores:** Equipo de Arquitectura JASRAPO
- **Referencia / Issue:** Issue #301 / [sc-301]

---

## Contexto y Problema

En el sistema JASRAPO, la entidad `Pagos` registra el ingreso de dinero desde el punto de vista del cliente, la caja/sesión y la transacción financiera (monto total recibido, medio de pago, fecha, referencia bancaria). Sin embargo, un único pago financiero puede liquidar parcial o totalmente una o varias obligaciones pendientes del cliente:

1. **Comprobantes / Facturas SRI:** Facturas electrónicas emitidas con saldo pendiente.
2. **Cuotas de Convenio:** Compromisos de pago diferidos derivados de acuerdos de financiamiento.
3. **Prefacturas / Cargos Iniciales:** Deudas de instalación o servicios especiales antes o después de la emisión definitiva.
4. **Saldos a Favor del Cliente:** Excedentes no aplicados que se transforman en crédito a favor (`SaldoFavorCliente`).

Se requiere definir formalmente cómo se modela y ejecuta la distribución de los pagos, garantizando integridad referencial estricta, soporte para pagos parciales, reversión consistente en anulaciones, y evitando referencias polimórficas débiles (`tipo + referencia_id`).

---

## Auditoría del Modelo Existente

| Entidad | Rol en el Dominio | Estado Actual en Schema Prisma |
| :--- | :--- | :--- |
| `Pagos` | Encabezado financiero de la recaudación (caja, cliente, monto total, estado). | Modelo existente (`pagos`). |
| `DetallePago` | Ledger de imputación a obligaciones específicas con FKs tipadas (`comprobanteId`, `cuotaConvenioId`, `tipoPago`, `montoAbonado`). | Modelo existente (`detalle_pago`). |
| `CuotaConvenio` | Obligación derivada de convenio con `saldoPendiente`, `montoPagado` y `estado`. | Modelo existente (`cuotas_convenio`). |
| `Comprobantes` | Facturas / comprobantes electrónicos con valores y estados SRI. | Modelo existente (`comprobantes`). |
| `SaldoFavorCliente` | Crédito disponible del cliente por sobrepagos o notas de crédito. | Modelo existente (`saldos_favor_cliente`). |

---

## Definición de Obligación Cobrable

En JASRAPO, una **Obligación Cobrable** es toda deuda exigible a un cliente con monto monetario definido y saldo pendiente $> 0$, clasificada en:
- **Obligación Facturada:** Representada por `Comprobantes` (factura emitida o autorizada).
- **Obligación Financiada:** Representada por `CuotaConvenio` con vencimiento programado.
- **Excedente / Saldo a Favor:** Cuando $\text{Monto Recibido} > \sum \text{Obligaciones Seleccionadas}$, el remanente se acredita en `SaldoFavorCliente`.

---

## Opciones Consideradas

### Opción 1: Reutilizar y Especializar `DetallePago` con Llaves Foráneas Tipadas (Elegida)
- Mantener `DetallePago` como la entidad de detalle de imputación vinculada a `Pagos`.
- Cada fila representa una asignación de monto a una obligación específica:
  - `comprobanteId` (FK a `Comprobantes`) cuando `tipoPago = COMPROBANTE`.
  - `cuotaConvenioId` (FK a `CuotaConvenio`) cuando `tipoPago = CUOTA_CONVENIO`.
  - Creación de registro en `SaldoFavorCliente` cuando `tipoPago = SALDO_FAVOR`.
- **Ventajas:**
  - Integridad referencial nativa en PostgreSQL mediante Foreign Keys reales (sin polimorfismo genérico `tipo + id`).
  - Cero migraciones destructivas ni duplicación de conceptos de pago en el esquema.
  - Compatibilidad completa con la infraestructura actual de cobros (`PaymentRepository`, `createPayment`, `annulPayment`).
- **Desventajas:**
  - Columnas de llave foránea opcionales (`NULL`) según el tipo de obligación en la misma tabla.

### Opción 2: Crear una Nueva Entidad Separada `AplicacionPago`
- Separar `DetallePago` (desglose por forma de pago: efectivo, cheque, transferencia) de `AplicacionPago` (imputación a deuda).
- **Ventajas:**
  - Separación teórica estricta entre instrumento de cobro e imputación contable.
- **Desventajas:**
  - Requiere migración estructural mayor, refactorización masiva de use cases de cobros, y sobrecarga relacional sin aportar garantías adicionales a las ya cubiertas por transacciones serializables y FKs explícitas.

---

## Decisión Tomada

Se decide **conservar y especializar `DetallePago`** (Opción 1) bajo las siguientes reglas arquitectónicas obligatorias:

1. **Integridad Relacional sin Polimorfismo Débil:** Se prohíben campos genéricos tipo `tipo_referencia VARCHAR` + `referencia_id BIGINT`. Cada destino de deuda cuenta con su Foreign Key explícita y constraints de integridad en base de datos.
2. **Atomicidad Transaccional:** Toda distribución de pagos se procesa en una única transacción de base de datos (`Serializable` o `ReadCommitted` con locks selectivos `FOR UPDATE`).
3. **Regla de Imputación y Pagos Parciales:**
   - La suma de `montoAbonado` de todos los `DetallePago` debe ser idéntica al `montoTotalRecibido` en `Pagos`.
   - Si el pago no cubre la totalidad de la obligación, se actualiza el `saldoPendiente` restando el abono y la obligación permanece en estado parcial (`VENCIDO` o `PENDIENTE`).
   - Si cubre el 100%, la obligación pasa a `PAGADA`.
4. **Tratamiento de Anulaciones y Reversos:**
   - Al anular un pago (`estadoPago = ANULADO`), el sistema revierte en reversa los saldos pendientes de cada comprobante/cuota imputada dentro de la misma transacción y desactiva los saldos a favor generados.
5. **Generación de Saldos a Favor:**
   - Cualquier saldo excedente genera un `SaldoFavorCliente` vinculado al `pagoId`, listo para ser aplicado como método de descuento en cobros posteriores.

---

## Consecuencias

- **Positivas:**
  - Modelo estable, tipado y sin duplicación innecesaria de entidades.
  - Trazabilidad y consistencia garantizadas para el cuadre diario de caja y reportes contables.
  - Soporte completo para cobro simultáneo de facturas corrientes + cuotas de convenio en una sola operación.
- **Negativas / Trade-offs:**
  - Las validaciones de consistencia cruzada (ej. verificar que `cuotaConvenio.contrato.clienteId === pago.clienteId`) deben garantizarse en el repositorio de dominio antes de insertar los registros.
