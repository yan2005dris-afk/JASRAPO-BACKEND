# TASK-01: Generar Orden de Inspección al Crear Contrato Nuevo y Ciclo de Estados del Medidor

## 1. Resumen / Historia de Usuario
**Como** Administrador / Cajero de la Junta,  
**Quiero** que al registrar un nuevo contrato de agua potable se genere automáticamente una Orden de Trabajo (OT) de tipo `INSPECCION`, el contrato quede en estado `PENDIENTE_INSPECCION` y el medidor asignado pase de `BODEGA` a `PENDIENTE`,  
**Para** garantizar la viabilidad técnica en campo antes de cobrar la instalación y asegurar que el medidor quede reservado hasta su instalación física definitiva (`INSTALADO`).

---

## 2. Contexto y Problema Actual
1. **Cobro prematuro:** `CreateContractUseCase` invoca actualmente la función SQL `generar_prefactura_instalacion`, dejando el contrato en `PENDIENTE_PAGO` antes de verificar si la acometida es viable.
2. **Inconsistencia de inventario del medidor:** El medidor no refleja claramente su etapa de reserva operativa: si se asigna al contrato en borrador/inspección, debe salir de `BODEGA` y pasar a `PENDIENTE`. Luego, cuando la OT de instalación se completa, debe actualizarse a `INSTALADO`.

---

## 3. Comportamiento Esperado y Reglas de Negocio

### A. Al Crear el Contrato (`POST /api/v1/contracts`)
1. **Desacoplar la Prefactura:** Ya **NO** se llama a `generar_prefactura_instalacion` en la creación.
2. **Estado del Contrato:** Se guarda en `estadoServicio = PENDIENTE_INSPECCION` y `estadoCobranza = NO_APLICA`.
3. **Estado del Medidor:** El medidor asignado cambia de `BODEGA` a `PENDIENTE` (reserva de stock).
4. **Generación de OT de Inspección:** En la misma transacción se crea la fila en `OrdenTrabajo`:
   * `tipoOrden = INSPECCION`
   * `estado = PENDIENTE`
   * `contratoId = nuevoContrato.contratoId`

### B. Resultado de la Inspección Técnica (Cierre de OT `INSPECCION`)
* **Si la Inspección es Aprobada / Factible (`COMPLETADA`):**
  * Contrato transiciona a `PENDIENTE_PAGO`.
  * Se genera la prefactura de instalación (`generar_prefactura_instalacion`).
  * El medidor se mantiene en estado `PENDIENTE`.
* **Si la Inspección es Rechazada / No Factible (`CANCELADA`):**
  * Contrato pasa a `RECHAZADO` (sin deuda generada).
  * El medidor se libera y regresa de `PENDIENTE` a `BODEGA`.

### C. Flujo Posterior: Pago e Instalación Física
1. **Pago de Instalación:** El cliente paga el 100% de la prefactura $\rightarrow$ `PagoValidadoHandler` pasa el contrato a `PENDIENTE_INSTALACION` y genera la OT de tipo `INSTALACION`.
2. **Cierre de Instalación Física (OT `INSTALACION` pasa a `COMPLETADA`):**
   * Contrato pasa a `ACTIVO` con `estadoCobranza = AL_DIA`.
   * El medidor pasa de `PENDIENTE` a `INSTALADO` y se registra su `fechaInstalacion = now()`.

---

## 4. Matriz de Estados

| Evento / Acción | Estado Contrato | Estado Medidor | OT Generada / Estado |
| :--- | :--- | :--- | :--- |
| **Creación del Contrato** | `PENDIENTE_INSPECCION` | `BODEGA` $\rightarrow$ `PENDIENTE` | `INSPECCION` (`PENDIENTE`) |
| **Inspección Aprobada** | `PENDIENTE_PAGO` | `PENDIENTE` | `INSPECCION` (`COMPLETADA`) |
| **Inspección Rechazada** | `RECHAZADO` | `PENDIENTE` $\rightarrow$ `BODEGA` | `INSPECCION` (`CANCELADA`) |
| **Pago Prefactura 100%** | `PENDIENTE_INSTALACION` | `PENDIENTE` | `INSTALACION` (`PENDIENTE`) |
| **Instalación Ejecutada** | `ACTIVO` | `PENDIENTE` $\rightarrow$ `INSTALADO` | `INSTALACION` (`COMPLETADA`) |

---

## 5. Criterios de Aceptación (DoD)
- [ ] Al crear un contrato (`POST /api/v1/contracts`), el contrato queda en `PENDIENTE_INSPECCION` y el medidor cambia a `PENDIENTE`.
- [ ] Se genera automáticamente la OT de tipo `INSPECCION` asociada al contrato.
- [ ] No se genera prefactura de cobro al momento de la creación.
- [ ] Si la OT de inspección se aprueba, el contrato pasa a `PENDIENTE_PAGO` y se genera la prefactura de instalación.
- [ ] Si la OT de inspección se rechaza, el contrato pasa a `RECHAZADO` y el medidor vuelve a `BODEGA`.
- [ ] Al completar la OT de `INSTALACION`, el contrato pasa a `ACTIVO` y el medidor a `INSTALADO` con fecha de instalación registrada.
- [ ] Pruebas unitarias e integración actualizadas cubriendo la máquina de estados completa.
