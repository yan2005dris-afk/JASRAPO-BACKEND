# TASK-06: Auditoría Obligatoria en Modificación de Borradores y Refacturación

## 1. Resumen / Historia de Usuario
**Como** Tesorero / Administrador de la Junta,  
**Quiero** exigir obligatoriamente el ingreso de la causa/motivo y registrar la autoría del usuario al modificar una prefactura en etapa de borrador o segunda revisión (refacturación),  
**Para** garantizar la trazabilidad contable, justificar ajustes de consumos y evitar alteraciones arbitrarias en la emisión mensual.

---

## 2. Contexto y Problema Actual
Las facturas pasan por una primera revisión (borrador del día 31) y una segunda revisión (refacturación). Si se ajusta una lectura o valor sin registrar quién lo hizo ni el motivo, se pierde la pista de auditoría ante reclamos de los abonados.

---

## 3. Reglas de Negocio y Flujo Técnico
1. **Estado Borrador:** La modificación solo está permitida mientras la prefactura esté en estado `GENERADA` o `EN_REVISION` (previo a la autorización definitiva ante el SRI).
2. **Campos Requeridos en DTO:**
   * `motivo`: string obligatorio (longitud mínima: 10 caracteres, máximo: 500).
   * `usuarioId`: capturado automáticamente desde el JWT de la sesión autenticada.
3. **Persistencia de Auditoría:** Registrar en tabla de auditoría los valores anteriores, valores nuevos, fecha, usuario y motivo.
4. **Interfaz (Frontend):** Modal de confirmación al guardar cambios en refacturación con textarea obligatorio para el motivo.

---

## 4. Criterios de Aceptación (DoD)
- [ ] Endpoint de modificación de prefactura rechaza peticiones sin campo `motivo` (HTTP 400).
- [ ] Se registra la trazabilidad completa en base de datos.
- [ ] No se permite modificar comprobantes que ya fueron autorizados por el SRI.
- [ ] Frontend presenta modal obligatorio para capturar la justificación antes de enviar.
