# Medidores

Inventario, asignación, reemplazo y retiro operativo de medidores.

> **Ficha de dominio:** documenta inventario, vínculo contractual, reemplazo, exportaciones, reporte de defectos y baja operativa del medidor.

## Alcance y entradas HTTP

- **Controladores:** `MeterController`, `OperatorController`.
- **Servicio:** `MeterService`.
- **Casos:** `CreateMeterUseCase`, `FindAllMetersUseCase`, `FindOneMeterUseCase`, `UpdateMeterUseCase`, `RemoveMeterUseCase`, `FindMeterHistoryUseCase`, `FindReplacementUseCase`, `ReplaceMeterUseCase`, `ExportMetersUseCase`, `ExportMetersPdfUseCase`, `ReportDefectUseCase`, `DecommissionMeterUseCase`.

| Método y ruta | Caso/servicio ejecutado | Resultado |
|---|---|---|
| `GET /api/v1/meters/status` | `MeterService.findAllStates()` | Catálogo. |
| `POST /api/v1/meters` | `create()` → `CreateMeterUseCase` | Alta. |
| `GET /api/v1/meters` / `:id` | `findAll()` / `findOne()` → consultas | Inventario/detalle. |
| `PATCH /api/v1/meters/:id` | `update()` → `UpdateMeterUseCase` | Actualización. |
| `DELETE /api/v1/meters/:id` | `remove()` → `RemoveMeterUseCase` | Soft delete. |
| `GET /api/v1/meters/export/csv` / `export/pdf` | exportación CSV/PDF | Archivo. |
| `GET /api/v1/meters/:id/history` | `FindMeterHistoryUseCase` | Historial. |
| `GET /api/v1/meters/replacements/:id` | `FindReplacementUseCase` | Reemplazo. |
| `POST /api/v1/meters/replace` | `ReplaceMeterUseCase` | Reemplazo transaccional. |
| `POST /api/v1/meters/replacements/:id/approve` | aprobación del servicio | Resolución aprobada. |
| `POST /api/v1/operator/:id/report-defect` | `ReportDefectUseCase` | `DANADO`. |
| `POST /api/v1/operator/:id/decommission` | `DecommissionMeterUseCase` | `BAJA`. |

## Ejemplo JSON

En los JSON de entrada, `null` representa un campo opcional omitido.

```json
{
  "medidorId": "10",
  "serie": "MED-12345",
  "marca": "Elster",
  "modelo": "V200",
  "estado": "INSTALADO"
}
```

| Campo | Tipo | Regla/uso |
|---|---|---|
| `medidorId` | string | `BigInt` serializado. |
| `serie` | string | Identificador único del inventario. |
| `marca`, `modelo` | string | Datos del equipo. |
| `estado` | enum | Ciclo operativo. |
| `evidenciaFotoUrl` | string/null | Evidencia de orden cuando corresponde. |

## Estados

| Estado | Significado |
|---|---|
| `BODEGA` | Disponible. |
| `PENDIENTE` | Reservado durante instalación. |
| `INSTALADO` | En servicio. |
| `DANADO` | Defecto reportado. |
| `BAJA` | Retirado del inventario. |

### Máquina de estados del Medidor

A diferencia de `Rutas` o `Lecturas`, los medidores **no tienen una tabla de transiciones formal** en un archivo único. Las transiciones válidas están codificadas en cada use case. Las reglas confirmadas son:

| Desde | Hacia permitidas | Validación |
|---|---|---|
| `[*]` | `BODEGA` | al crear (`CreateMeterUseCase.execute()` línea 23) |
| `BODEGA` o `PENDIENTE` | `INSTALADO` | al instalar/reemplazar (`prisma-meter.repository.ts:replaceMeter`) |
| `INSTALADO` | `DANADO` | solo desde `INSTALADO` — `ReportDefectUseCase:26-30` rechaza otros estados con `InvalidDomainOperationException` |
| `DANADO` | `BAJA` | solo desde `DANADO` — `DecommissionMeterUseCase:23-30` rechaza otros estados |
| `BAJA` | _(ninguna)_ | **No hay reversión ni reactivación.** Confirmado por búsqueda exhaustiva. |
| `INSTALADO` | `BAJA` directo | **No existe.** Hay que pasar por `DANADO` (vía reporte de defecto) antes. |

El doc muestra el flujo como lineal; la realidad es que `INSTALADO → BAJA` directo está prohibido por el código. El diagrama mermaid debajo conserva el flujo lineal por simplicidad pero la tabla refleja las restricciones reales.

### Estados internos de ReemplazoMedidor

La entidad `ReemplazoMedidor` tiene DOS enums de estado propios, distintos del estado del medidor:

**`EstadoResolucionConsumo`** (`backend/src/shared/enums/index.ts`):

| Valor | Significado |
|---|---|
| `PENDIENTE` | Reemplazo registrado, aún sin aplicar al consumo. |
| `APLICADA` | Consumo aplicado según el tratamiento definido. |
| `ANULADA` | Reemplazo anulado; no afecta al consumo. |

**`EstadoAprobacionReemplazo`** (`backend/src/shared/enums/index.ts`):

| Valor | Significado |
|---|---|
| `PENDIENTE` | Reemplazo con tratamiento excepcional esperando aprobación. |
| `APROBADA` | Tratamiento autorizado por un usuario distinto del solicitante. |
| `RECHAZADA` | Tratamiento rechazado. |

El reemplazo **estándar** (`TratamientoSaliente.COBRO_REAL` + `TratamientoEntrante.FACTURAR_PERIODO_ACTUAL`) se autoaprueba en el mismo flujo de `replace-meter.use-case.ts:150-152`. El **excepcional** queda `PENDIENTE` hasta que otro usuario lo apruebe vía `POST /api/v1/meters/replacements/:id/approve`.

## Efectos y transacciones

Crear/actualizar/eliminar escriben `Medidores`; eliminar usa soft delete. Reemplazar registra reemplazo, historial, lecturas y resolución económica en la transacción del caso. Reportar defecto y dar de baja cambian estado y pueden crear tarea/novedad. Exportaciones, consultas y DTO son puras; CSV/PDF no son respuestas JSON.

| Tabla Prisma | Uso |
|---|---|
| `Medidores` | Inventario, estado y soft delete. |
| `Contratos`, `HistorialMedidores` | Asignación y trazabilidad. |
| `ReemplazoMedidor` | Ciclo de reemplazo. |
| `Lecturas` | Lectura final/inicial. |
| `OrdenTrabajo`, `NovedadOrdenTrabajo` | Inspección y evidencia. |

## Gráfico de estados

Alcance del diagrama: **Confirmado** para las operaciones explícitas de inventario, instalación, defecto y baja. No se encontró reactivación desde `BAJA`. La transición `INSTALADO → BAJA` directo **no existe**: hay que pasar por `DANADO` (vía reporte de defecto) antes. Las validaciones de estado origen están implementadas en `ReportDefectUseCase` y `DecommissionMeterUseCase`.

```mermaid
stateDiagram-v2
  [*] --> BODEGA: crear
  BODEGA --> PENDIENTE: vinculación/reserva
  PENDIENTE --> INSTALADO: instalación
  INSTALADO --> DANADO: reportar defecto
  DANADO --> BAJA: dar de baja
  INSTALADO -.no permitida.-> BAJA
  note right of BAJA
    No se encontró una reactivación.
  end note
```

## Casos de uso

### Caso: Crear medidor

**Descripción:** registra un equipo en inventario.  
**HTTP y ruta:** `POST /api/v1/meters`.  
**Permiso:** `meters:create`.  
**Cadena:** `MeterController.create()` → `MeterService.create()` → `CreateMeterUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `409` serie duplicada.  
**Efectos:** alta en `Medidores`.  
**Prisma:** `Medidores`.  
**Entrada:**

```json
{
  "serie": "MED-12345",
  "marca": "Elster",
  "modelo": "V200",
  "fechaInstalacion": null,
  "latitud": null,
  "longitud": null
}
```

**Salida:**

```json
{
  "medidorId": "10",
  "serie": "MED-12345",
  "estado": "BODEGA"
}
```

### Caso: Listar medidores

**Descripción:** consulta el inventario paginado y filtrable.  
**HTTP y ruta:** `GET /api/v1/meters`.  
**Permiso:** `meters:read`.  
**Cadena:** `MeterController.findAll()` → `MeterService.findAll()` → `FindAllMetersUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`.  
**Efectos:** ninguno; consulta y DTO puros.  
**Prisma:** `Medidores`, relaciones contractuales.  
**Entrada:** sin body; query `page`, `limit`, estado y búsqueda.  
**Salida:**

```json
{
  "data": [
    {
      "medidorId": "10",
      "estado": "INSTALADO"
    }
  ],
  "meta": {}
}
```

### Caso: Obtener medidor

**Descripción:** devuelve el detalle de un medidor por identificador.  
**HTTP y ruta:** `GET /api/v1/meters/:id`.  
**Permiso:** `meters:read`.  
**Cadena:** `MeterController.findOne()` → `MeterService.findOne()` → `FindOneMeterUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** ninguno; DTO puro.  
**Prisma:** `Medidores`, relaciones contractuales.  
**Entrada:** sin body; path `id=10`.
**Salida:** objeto `MeterResponseDto`, como el ejemplo principal.

### Caso: Actualizar medidor

**Descripción:** modifica datos permitidos del inventario.  
**HTTP y ruta:** `PATCH /api/v1/meters/:id`.  
**Permiso:** `meters:update`.  
**Cadena:** `MeterController.update()` → `MeterService.update()` → `UpdateMeterUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`; `409` serie duplicada.  
**Efectos:** actualiza `Medidores`; DTO puro.  
**Prisma:** `Medidores`.  
**Entrada:** path `id=10`; body:

```json
{
  "marca": "Itron",
  "modelo": null
}
```
**Salida:**

```json
{
  "medidorId": "10",
  "marca": "Itron",
  "estado": "BODEGA"
}
```

### Caso: Eliminar medidor

**Descripción:** marca el medidor como eliminado lógicamente.  
**HTTP y ruta:** `DELETE /api/v1/meters/:id`.  
**Permiso:** `meters:delete`.  
**Cadena:** `MeterController.delete()` → `MeterService.remove()` → `RemoveMeterUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** establece `deletedAt`.  
**Prisma:** `Medidores`.  
**Entrada:** sin body; path `id=10`.
**Salida:**

```json
{
  "message": "Medidor eliminado correctamente"
}
```

### Caso: Reemplazar medidor

**Descripción:** cambia el equipo de un contrato y conserva trazabilidad de lecturas y resolución económica.  
**HTTP y ruta:** `POST /api/v1/meters/replace`.  
**Permiso:** `meters:update`.  
**Cadena:** `MeterController.replace()` → `MeterService.replaceMeter()` → `ReplaceMeterUseCase.execute()` → transacción/repositorios.  
**Errores relevantes:** `400`; `401`; `403`; `404`; lectura inconsistente.  
**Efectos:** reemplazo, historial y lecturas en transacción.  
**Prisma:** `ReemplazoMedidor`, `Medidores`, `HistorialMedidores`, `Lecturas`, `Contratos`.  
**Entrada:** body `ReplaceMeterDto` con contrato, medidores y lecturas final/inicial.  
**Salida:**

```json
{
  "reemplazoMedidorId": "4",
  "medidorAnteriorId": "10",
  "medidorNuevoId": "11"
}
```

### Caso: Obtener reemplazo de medidor

**Descripción:** consulta el detalle de un reemplazo registrado.  
**HTTP y ruta:** `GET /api/v1/meters/replacements/:id`.  
**Permiso:** `meters:read`.  
**Cadena:** `MeterController.findReplacement()` → `MeterService.findReplacement()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** ninguno; consulta y DTO puros.  
**Prisma:** `ReemplazoMedidor`, `Medidores`, `Contratos`.  
**Entrada:** sin body; path `id=4`.
**Salida:**

```json
{
  "reemplazoMedidorId": "4",
  "medidorAnteriorId": "10",
  "medidorNuevoId": "11"
}
```

### Caso: Aprobar reemplazo de medidor

**Descripción:** aprueba el tratamiento económico o técnico de un reemplazo pendiente.  
**HTTP y ruta:** `POST /api/v1/meters/replacements/:id/approve`.  
**Permiso:** `meter-replacements:approve`.  
**Cadena:** `MeterController.approveReplacement()` → `MeterService.approveReplacement()` → caso/repositorio de aprobación.  
**Errores relevantes:** `400`; `401`; `403`; `404`; conflicto de resolución.  
**Efectos:** en una transacción, valida identidad del aprobador (debe ser distinto del solicitante), confirma idempotencia si ya estaba aprobada, valida que esté en `PENDIENTE`, promueve las lecturas vinculadas a `APROBADA` con `fechaValidacion`, y persiste `estadoAprobacion: APROBADA`, `autorizadoPorUsuarioId`, `autorizadoEn`. Si la combinación de tratamientos es "estándar" (no `requiereAprobacion`), el reemplazo se autoaprueba al crearse; no es necesario llamar a este endpoint en ese caso.  
**Prisma:** `ReemplazoMedidor`, `Lecturas` (vinculadas), `Medidores`, `Contratos`.  
**Entrada:** sin body; path `id=4`.
**Salida:**

```json
{
  "reemplazoMedidorId": "4",
  "estado": "APROBADO"
}
```

### Caso: Exportar inventario CSV

**Descripción:** descarga el inventario filtrado en formato CSV.  
**HTTP y ruta:** `GET /api/v1/meters/export/csv`.  
**Permiso:** `meters:read`.  
**Cadena:** `MeterController.exportCsv()` → `MeterService.exportCsv()` → `ExportMetersUseCase.execute()`.  
**Errores relevantes:** `400`; `401`; `403`; error de generación.  
**Efectos:** sólo lectura y generación.  
**Prisma:** `Medidores` y relaciones seleccionadas.  
**Entrada:** sin body; query `ExportMeterDto`.  
**Salida:** no es JSON: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment` y contenido CSV.

### Caso: Exportar inventario PDF

**Descripción:** genera un reporte PDF del inventario filtrado.  
**HTTP y ruta:** `GET /api/v1/meters/export/pdf`.  
**Permiso:** `meters:read`.  
**Cadena:** `MeterController.exportPdf()` → `MeterService.exportPdf()` → `ExportMetersPdfUseCase.execute()`.  
**Errores relevantes:** `400`; `401`; `403`; error de generación.  
**Efectos:** sólo lectura y generación.  
**Prisma:** `Medidores` y relaciones seleccionadas.  
**Entrada:** sin body; query `ExportMeterDto`.  
**Salida:** no es JSON: `application/pdf`, `Content-Disposition: attachment`, `Content-Length` y bytes PDF.

### Caso: Reportar defecto de medidor

**Descripción:** registra que un medidor presenta un defecto operativo.  
**HTTP y ruta:** `POST /api/v1/operator/:id/report-defect`.  
**Permiso:** `meters:update`.  
**Cadena:** `OperatorController.reportDefect()` → `ReportDefectUseCase.execute()` → repositorio.  
**Errores relevantes:** `400` estado/ID; `401`; `403`; `404`; `409`.  
**Efectos:** actualiza el estado a `DANADO` y puede crear novedad/evidencia.  
**Prisma:** `Medidores`, `NovedadOrdenTrabajo`, `OrdenTrabajo`.  
**Entrada:** path `id=10`; body según el DTO de defecto.
**Salida:** `MeterResponseDto`, por ejemplo:

```json
{
  "medidorId": "10",
  "estado": "DANADO"
}
```

### Caso: Dar de baja un medidor

**Descripción:** retira un medidor del inventario operativo.  
**HTTP y ruta:** `POST /api/v1/operator/:id/decommission`.  
**Permiso:** `meters:delete`.  
**Cadena:** `OperatorController.decommissionMeter()` → `DecommissionMeterUseCase.execute()` → repositorio.  
**Errores relevantes:** `400` estado/ID; `401`; `403`; `404`; `409`.  
**Efectos:** actualiza el estado a `BAJA` y registra el motivo/historial.  
**Prisma:** `Medidores`, historial y auditoría relacionada.  
**Entrada:** path `id=10`; body:

```json
{
  "motivoBaja": "Replacement"
}
```
**Salida:** `MeterResponseDto`, por ejemplo:

```json
{
  "medidorId": "10",
  "estado": "BAJA"
}
```

## Pendientes funcionales

Bloqueos confirmados como pendientes en el código revisado. Cuando se cierre cada uno, sacar de acá y mover a la sección correspondiente.

- **Reversión/reactivación desde `BAJA`.** Sigue sin haber camino de vuelta. Confirmado por búsqueda exhaustiva; no hay caso de uso ni endpoint que cambie `BAJA` a otro estado. Si se requiere reactivación, hay que agregar el flujo correspondiente.
- **Forma exacta de los DTOs `report-defect` y `decommission`.** El doc muestra solo un ejemplo parcial del body. Confirmar contra el código actual los campos obligatorios y opcionales.
- **Reglas de timeout y notificación para reemplazos pendientes de aprobación.** No se detectó mecanismo de timeout ni notificación automática para reemplazos en `EstadoAprobacionReemplazo: PENDIENTE`. Si el aprobador nunca actúa, el reemplazo queda esperando indefinidamente.
- **Estados completos de `EstadoAsignacion` (`NO_ASIGNADA` | `ASIGNADA` | `TOMADA` | `COMPLETADA`) y su rol actual.** Marcado como legacy en `04-rutas-y-ordenes.md`. Sigue sin clarificación sobre si aplica al flujo de medidores.

## No documentado o pendiente de confirmar

- Forma exacta de los DTOs `replace` y `find-replacement`. Confirmar contra el código actual.

## Comportamiento de negocio verificable

Las tablas relacionadas son `Medidores`, `Contratos`, `HistorialMedidores`, `ReemplazoMedidor`, `Lecturas`, `OrdenTrabajo` y `NovedadOrdenTrabajo`. El reemplazo es transaccional y conserva trazabilidad; los defectos/bajas cambian el estado del inventario. La transición del contrato asociado al completar una instalación (`INSTALACION`) o reconexión (`RECONEXION`) SÍ existe — está implementada vía `applyContractLifecycleTransition` (`backend/src/operations/routes/infrastructure/repositories/prisma-orden-trabajo.repository.ts:356-403`) y documentada en `02-contratos.md`, sección "Transiciones de estado del contrato".
