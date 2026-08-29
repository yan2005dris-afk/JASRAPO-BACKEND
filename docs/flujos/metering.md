# Flujo: Metering (Medición)

> Estado: documenta el código **tal como está implementado** en `backend/src/metering/`, no el diseño deseado. Fecha de referencia: 2026-07.

## Resumen

Ciclo físico del agua: inventario de medidores, captura de lecturas en campo (app de operador), revisión/aprobación de lecturas y registro de anomalías. Solo las lecturas en estado `APROBADA` alimentan la generación de prefacturas (ver [ciclo-facturacion-cobros.md](./ciclo-facturacion-cobros.md)).

Sub-dominios: `meters/` (inventario), `operator/` (superficie para el operador de campo), `readings/` (lecturas), `reading-anomaly/` (anomalías).

## 1. Ciclo de vida del medidor

`MeterController` (`/meters`) — CRUD estándar más transiciones de estado explícitas:

- `POST /meters/:id/install` — `BODEGA → INSTALADO` (vincula el medidor a un contrato).
- `POST /meters/:id/report-defect` — marca `DANADO`.
- `POST /meters/:id/decommission` — da de baja (`BAJA`).

Estados: `BODEGA`, `INSTALADO`, `DANADO`, `PENDIENTE`, `BAJA`.

## 2. Captura en campo (`operator/`)

`OperatorController` expone la superficie que usa la app/operador de ruta, separada del CRUD administrativo:

- `GET /operator/readings` — lecturas asignadas a la ruta/tarea del operador.
- `GET /operator/readings/anomalies` — cola de lecturas con anomalías reportadas.
- `PATCH /operator/readings/:id` — el operador registra/actualiza una lectura; `foto` se guarda como clave de objeto RustFS en `OrdenesTrabajo.evidenciaFotoUrl` de la orden vinculada.
- `GET /operator/tasks` / `PATCH /operator/tasks/:id` — órdenes de trabajo asignadas al operador y su estado.
- `GET /operator/sync` — endpoint de sincronización (soporta app con capacidad offline).

## 3. Alta y actualización de lecturas

Las lecturas se generan dentro de los procesos de asignación de rutas. La actualización administrativa usa `PATCH /readings/:id` y el operador usa `PATCH /operator/readings/:id`.

### Histórico / Legacy — no es contrato vigente

En SC-283 se retiraron de la documentación contractual el endpoint standalone `POST /readings` y `CreateReadingUseCase` como vía de alta. Las lecturas ahora nacen dentro de rutas u órdenes de trabajo y se actualizan mediante los endpoints PATCH vigentes.

La evidencia fotográfica normal pertenece a la orden de trabajo vinculada (`OrdenesTrabajo.evidenciaFotoUrl`) y se guarda como clave de objeto RustFS. `LecturaAnomalia.fotoUrl` se conserva exclusivamente para fotos de anomalías.

Como referencia histórica, las tareas del operador se nombraban `POST /operator/:id/install`, `report-defect` y `decommission`; esos endpoints no son contrato vigente y fueron reemplazados por la instalación administrativa `POST /meters/:id/install` y la gestión de órdenes mediante `PATCH /operator/tasks/:id`.

## 4. Revisión de la lectura

`UpdateReadingUseCase` aplica una máquina de estados explícita. Extracto relevante:

```
PENDIENTE   → POR_REVISION | ...
POR_REVISION → APROBADA | RECHAZADA_VERIFICACION
```

`APROBADA` y `RECHAZADA_VERIFICACION` son terminales para esa transición (sin salidas desde ese punto en el código actual); `PLANILLADA` existe como estado pero sus transiciones están marcadas como "pendiente de definir" en el propio código (comentario en `update-reading.use-case.ts`). Solo lecturas `APROBADA` son elegibles para el lote de facturación.

## 5. Anomalías

`reading-anomaly/` registra incidencias (fugas, daños, consumo anómalo) con foto y observación, como entidad separada del estado de la lectura — permite que una lectura avance en su propio flujo de aprobación mientras la anomalía se gestiona en paralelo (cola visible en `GET /operator/readings/anomalies`).

## Relación con otros módulos

- `operations/contracts` es dueño del vínculo cliente↔medidor↔categoría de tarifa; `metering/` no gestiona esa relación, solo referencia `contratoId`/`medidorId`.
- La función SQL `generar_prefacturas_lote` (billing) es el único consumidor de lecturas `APROBADA` — si no existe una lectura aprobada para un contrato en el período, ese contrato simplemente se omite del lote (no genera error).

## Archivos clave

- `backend/src/metering/meters/interfaces/http/meter.controller.ts`
- `backend/src/metering/operator/interfaces/http/operator.controller.ts`
- `backend/src/metering/readings/application/use-cases/create-reading.use-case.ts`
- `backend/src/metering/readings/application/use-cases/update-reading.use-case.ts`
- `backend/src/metering/reading-anomaly/`
- `docs/architecture/modules/metering.md`
