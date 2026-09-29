# TASK-07: Flujo de Cuadre y Cierre Diario de Caja a las 19:00 con Bloqueo por Discrepancia

## 1. Resumen / Historia de Usuario
**Como** Cajero / Tesorero de la Junta,  
**Quiero** realizar un único cuadre y cierre diario de caja a las 19:00 desglosado por método de pago (efectivo, cheque, transferencias), con bloqueo del sistema ante diferencias físicas,  
**Para** garantizar el balance financiero exacto, evitar descuadres contables y asegurar la inmutabilidad de la jornada de recaudación.

---

## 2. Contexto y Problema Actual
* Se realiza un único cierre al día (19:00).
* Si un cliente asiste después de las 19:00, el sistema bloquea cobros para esa jornada.
* Si el dinero físico no cuadra con el sistema, no debe permitirse el cierre definitivo.
* El cierre debe ser inmutable y administrado por Tesorería.

---

## 3. Flujo Operativo del Cierre
1. **Envío de Comprobantes al SRI:** Previo al arqueo, verificar que las facturas del día estén enviadas/procesadas.
2. **Apertura de Cuadre:** El sistema calcula y muestra los totales cobrados clasificados en:
   * Total Efectivo
   * Total Cheques
   * Total Transferencias
3. **Conteo Físico Mandatorio:** El cajero ingresa la cantidad física real contada en caja (desglose de billetes/monedas y cheques).
4. **Validación de Discrepancia:**
   * Si `Monto Fisico == Monto Sistema`: Se habilita el botón "ENVIAR / CONFIRMAR CIERRE".
   * Si `Monto Fisico != Monto Sistema`: El sistema **BLOQUEA** el cierre definitivo y resalta la diferencia.
5. **Cierre Definitivo:** Al presionar ENVIAR, la caja pasa a estado `CERRADA` e inmutable. No se admiten múltiples cierres parciales en el día.

---

## 4. Criterios de Aceptación (DoD)
- [ ] El módulo de caja presenta el resumen de cobros por Efectivo, Cheque y Transferencia.
- [ ] Formulario de conteo físico valida automáticamente contra el total del sistema.
- [ ] El botón de confirmación permanece deshabilitado mientras exista diferencia no cuadrada.
- [ ] Tras el cierre de las 19:00, la caja queda bloqueada para nuevos cobros hasta la apertura del día siguiente.
