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
- `PATCH /operator/readings/:id` — el operador registra/actualiza una lectura (incluye foto).
- `POST /operator/:id/install` / `report-defect` / `decommission` — mismas transiciones de medidor, expuestas también desde el flujo de campo.
- `GET /operator/tasks` / `PATCH /operator/tasks/:id` — órdenes de trabajo asignadas al operador y su estado.
- `GET /operator/sync` — endpoint de sincronización (soporta app con capacidad offline).

## 3. Creación de una lectura

`CreateReadingUseCase` (`backend/src/metering/readings/application/use-cases/create-reading.use-case.ts`):

1. Si no se indica `periodoId`, resuelve el período `ABIERTO` activo (solo puede haber uno; si no hay ninguno, rechaza).
2. Inserta la lectura **siempre** en estado `POR_REVISION` — nunca directo a `APROBADA`, sin importar quién la cree.
3. `consumoCalculado` por defecto es `0` en la creación (el cálculo real de consumo para facturación ocurre en `generar_prefacturas_lote`, no aquí).
4. Admite `fotoUrl` y `descripcionAnomalia` opcionales.

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
