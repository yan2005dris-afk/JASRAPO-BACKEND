# TASK-10: Transición Automática de Período a 'PROCESANDO' y 'CERRADO' en el Ciclo de Facturación

## 1. Resumen / Historia de Usuario
**Como** Administrador / Encargado de Facturación,  
**Quiero** que cuando las rutas de toma de lectura se completen y se inicie la generación del lote de planillas/facturación, el período transicione automáticamente de `ABIERTO` a `PROCESANDO` (bloqueando el ingreso o modificación de lecturas en campo), y que al culminar la corrida y aprobación del lote transicione a `CERRADO`,  
**Para** proteger la integridad matemática y temporal de los consumos medidos, impedir inconsistencias entre lecturas y facturas, y habilitar la recaudación en caja con deudas formalmente liquidadas.

---

## 2. Contexto y Reglas de Negocio

### A. Ciclo de Vida del Período
1. **`ABIERTO` (Toma de lecturas activa):**
   * Es el período operativo activo del mes.
   * La cuadrilla de operadores en campo ingresa lecturas a través de las rutas asignadas.
   * La API (`prisma-operator.repository` / `prisma-reading.repository`) solo acepta lecturas si el período tiene `estado: ABIERTO`.

2. **`PROCESANDO` (Cálculo y congelamiento de consumos):**
   * **Disparador:** Se da por finalizado el cronograma de lectura mensual y se inicia la corrida del lote de facturación (`POST /billing/batches/generate` o workflow equivalente).
   * **Reglas:**
     * El sistema valida que las rutas del período estén en estado `COMPLETADA` (o con incidencias/anomalías resueltas o justificadas).
     * El período cambia atómicamente a `estado: PROCESANDO`.
     * **Bloqueo Operativo:** A partir de este momento, se rechaza cualquier creación, modificación o recálculo de lecturas ordinarias asociadas a este `periodoId`.
     * Se ejecutan los algoritmos de liquidación: consumos medidos, rubros fijos, cargos por exceso, subsidios (tercera edad, discapacidad) y generación de `Prefacturas` con `PrefacturaDetalle`.

3. **`CERRADO` (Liquidación sellada y cobro activo):**
   * **Disparador:** La generación del lote de planillas concluye con éxito y el lote queda formalizado para emisión/cobro.
   * **Reglas:**
     * El período transiciona a `estado: CERRADO`.
     * Los consumos y valores de ese mes quedan inmutables para fines contables y de auditoría histórica.
     * Las prefacturas quedan disponibles en el módulo de Caja y Cobranzas (`saldoActual > 0`, `estadoServicio: ACTIVO`).
     * **Nota de Negocio:** La existencia de planillas impagas **no impide** que el período esté `CERRADO`. La recaudación se extiende en el tiempo sobre las planillas individuales según su `fechaVencimiento`.

---

## 3. Requerimientos Técnicos

### Backend
1. **Orquestación en Use Case / Servicio de Facturación (`GenerateBillingBatchUseCase`):**
   * Validar que el período esté en `ABIERTO` antes de comenzar. Si está en `PROCESANDO` o `CERRADO`, retornar excepción de dominio (`ConflictException` / `InvalidDomainOperationException`).
   * Al iniciar la transacción de generación de lote: actualizar `periodo.estado = EstadoPeriodo.PROCESANDO`.
   * Al finalizar la transacción exitosa: actualizar `periodo.estado = EstadoPeriodo.CERRADO`.
   * En caso de error irrecuperable en el lote: revertir a `ABIERTO` (o registrar el fallo en el lote para resolución técnica sin corromper el período).
2. **Guard / Interceptor de Lecturas:**
   * Garantizar que `CreateReadingUseCase` y endpoints de sincronización móvil validen que el `periodoId` se encuentre estrictamente en `ABIERTO`.

### Frontend
1. **Módulo de Lotes / Facturación:**
   * Mostrar advertencia al usuario antes de disparar la generación: *"Al generar el lote, el período pasará a estado EN PROCESO y no se admitirán nuevas lecturas de campo"*.
   * Actualización reactiva del badge de estado del período en la tabla de Administración de Períodos (`ABIERTO` -> `PROCESANDO` -> `CERRADO`).
2. **Módulo de Lecturas / Rutas:**
   * Si el período está en `PROCESANDO` o `CERRADO`, deshabilitar acciones de edición o ingreso de lecturas en la UI con tooltip informativo.

---

## 4. Criterios de Aceptación (DoD)
- [ ] No es posible disparar un lote de facturación si el período ya está `CERRADO`.
- [ ] Al disparar la generación de prefacturas/lote, el período pasa atómicamente a `PROCESANDO`.
- [ ] Intentar enviar lecturas de medidor para un período en `PROCESANDO` o `CERRADO` retorna error HTTP 409 / 400.
- [ ] Al culminar con éxito el lote de facturación, el período queda automáticamente en `CERRADO`.
- [ ] Las planillas generadas quedan con sus saldos listos para recaudación en caja sin alterar el estado `CERRADO` del período.
- [ ] Pruebas unitarias de casos de uso y pruebas de integración cubriendo las transiciones de estado y los bloqueos de lecturas concurrentes.
