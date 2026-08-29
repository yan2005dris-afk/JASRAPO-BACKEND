# Operario Tareas — Unified Task System

## Problema

Hoy el operador tiene dos sistemas de trabajo desconectados:

| Sistema | Cómo se asignan | Endpoint |
|---------|----------------|----------|
| **Rutas** (lecturas) | Asignadas por período + comunidad/sector | `GET /operator/readings` |
| **Órdenes de trabajo** (instalación, reconexión, inspección) | Asignadas por ruta y operador | `GET/PATCH /operator/tasks` |

La vista unificada de órdenes permite planificar el recorrido por zona y evita mezclar contratos fuera de la asignación del operador.

## Objetivo

Unificar TODO el trabajo del operador en un sistema de tareas con **conocimiento geográfico**, donde:

1. Cada tarea tiene ubicación (`comunidadId` + `sectorId`)
2. Las tareas tienen orden dentro de la zona geográfica
3. Las tareas extras se asignan al operador que YA tiene ruta en esa zona
4. El operador ve una sola lista ordenada de su día de trabajo

## Concepto unificado: Ruta = Tarea

En vez de crear una tabla separada, **Rutas se convierte en la entidad unificada de trabajo del operador**. Una ruta ES una tarea. 

```
Ruta / Tarea
├── Quién: operarioId
├── Qué:  tipoRuta (TOMA_LECTURA | INSTALACION | RECONEXION | INSPECCION)
├── Dónde: comunidadId + sectorId (para agrupar geográficamente)
├── Orden: orden dentro de la zona
├── Estado: PENDIENTE → EN_PROGRESO → COMPLETADA | CANCELADA
├── Para TOMA_LECTURA: contiene lecturas (tabla Lecturas, como hoy)
└── Para INSTALACION/RECONEXION/INSPECCION: referencia a medidorId
```

### Tipos de tarea

| Tipo | Descripción | Referencia | Cómo se crea |
|------|-------------|-----------|-------------|
| `TOMA_LECTURA` | Lectura de medidor en ruta | Varias lecturas (tabla Lecturas) | Asignación de ruta de período |
| `INSTALACION` | Instalar medidor PENDIENTE | `medidorId` | Admin crea tarea + endpoint install |
| `RECONEXION` | Reconectar servicio | `medidorId` | Cuando contrato pasa a RECONEXION |
| `INSPECCION` | Verificar medidor (anomalía) | `medidorId` | Cuando se reporta anomalía |

### Estados

Los estados de Rutas ya cubren el ciclo de vida:

```
PENDIENTE → EN_PROGRESO → COMPLETADA
PENDIENTE → CANCELADA
EN_PROGRESO → COMPLETADA
EN_PROGRESO → CANCELADA
```

El estado `PARCIAL` se usa solo para TOMA_LECTURA (algunas lecturas hechas, otras no).

### Flujo de asignación geográfica

Cuando se crea una tarea extra (instalación, reconexión):

1. Buscar el operador que YA tiene rutas en esa `comunidadId` + `sectorId`
2. Asignarle la tarea a ese operador
3. La tarea se inserta con el `orden` siguiente a las tareas existentes en esa zona

Si no hay operador con rutas en esa zona → queda sin asignar (bandeja de administrador).

## Arquitectura

### Cambios en Rutas (Prisma)

No se crea tabla nueva. Se **extiende** el modelo existente `Rutas`:

```prisma
// CAMBIOS en Rutas.prisma

enum TipoRuta {
  TOMA_LECTURA
  RECONEXION
  INSTALACION    // NUEVO
  INSPECCION     // NUEVO
}

model Rutas {
  // ... campos existentes ...
  
  medidorId    BigInt?   @map("medidor_id")     // NUEVO — para tareas linked a medidor
  orden        Int       @default(0) @map("orden")  // NUEVO — orden dentro de zona
  observacion  String?   @map("observacion")     // NUEVO — nota opcional
  fechaLimite  DateTime? @map("fecha_limite")    // NUEVO — opcional

  medidor  Medidores?  @relation(fields: [medidorId], references: [medidorId]) // NUEVO
  
  // ... relaciones existentes ...
  
  @@index([medidorId])  // NUEVO
  @@index([orden])      // NUEVO
}
```

**Campos existentes que ya sirven:**
- `operarioId` → quién hace la tarea
- `tipoRuta` → qué tipo de tarea
- `comunidadId` + `sectorId` → geografía
- `estado` (PENDIENTE, EN_PROGRESO, COMPLETADA, PARCIAL, CANCELADA) → ciclo de vida
- `periodoId` (nullable) → para TOMA_LECTURA vinculada a período
- `fechaPlanificada`, `fechaInicio`, `fechaFin` → fechas del trabajo
- `nombre`, `descripcion` → identifican la tarea

**Relaciones existentes que se mantienen (sin cambios):**
- `Lecturas` para `TOMA_LECTURA`
- `Contratos` → `Medidores` para las otras tareas

### Birth of tasks

- **TOMA_LECTURA**: cuando se asigna una ruta de período al operador (como hoy)
- **INSTALACION/RECONEXION/INSPECCION**: se crean como filas en `Rutas` con el nuevo `tipoRuta`
- Las tareas no-lectura se crean desde el sistema (admin) o desde los endpoints de operador (install/report-defect/decommission)

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/operator/tasks` | Lista de Rutas del operador ordenadas por comunidad/sector/orden |
| `PATCH` | `/operator/tasks/:id` | Actualizar estado (completar, cancelar) + transiciones asociadas |
| `POST` | `/operator/tasks` | (admin) Crear tarea individual (Ruta con tipo no-lectura) |
| `POST` | `/operator/tasks/:id/assign` | (admin) Reasignar tarea a otro operador |

### Conviviencia con sistema actual

Como **Rutas = Tareas**, no hay migración de datos. El cambio es evolutivo:

- `GET /operator/readings` sigue funcionando — es una view filtrada de Rutas tipo TOMA_LECTURA con sus lecturas
- `GET /operator/tasks` es la view unificada — devuelve TODAS las Rutas del operador
- La instalación administrativa válida es `POST /meters/:id/install`; las órdenes de campo se actualizan mediante `PATCH /operator/tasks/:id`
- El flujo de asignación geográfica se aplica al crear tareas nuevas (buscar operador con rutas en esa zona)

## Lo que NO cambia

- `Periodos` y su lógica no cambian
- `Medidores` y su state machine no cambian
- `Lecturas` y sus transiciones no cambian
- `Rutas` como modelo NO se reemplaza — se **extiende**
- El histórico de endpoints legacy se conserva solo como referencia ADR; no debe usarse para integrar clientes nuevos

## Orden automático por coordenadas

Los medidores ya tienen `latitud` y `longitud` en la base de datos. Esto permite ordenar tareas automáticamente por proximidad geográfica.

### Datos disponibles

| Tipo de tarea | Cómo obtiene coordenadas |
|---------------|------------------------|
| `TOMA_LECTURA` | Cada Lectura → `medidorId` → `Medidores.latitud/longitud` |
| `INSTALACION` | `Rutas.medidorId` → `Medidores.latitud/longitud` |
| `RECONEXION` | `Rutas.medidorId` → `Medidores.latitud/longitud` |
| `INSPECCION` | `Rutas.medidorId` → `Medidores.latitud/longitud` |

### Algoritmo propuesto (Fase 1)

Para cada zona geográfica (`comunidadId` + `sectorId`):

1. Obtener coordenadas de cada tarea en la zona
2. Calcular distancia entre puntos usando **fórmula de haversine** (distancia en km entre coordenadas)
3. Aplicar **Nearest Neighbor** (vecino más cercano): empezar desde un punto inicial, elegir el no visitado más cercano
4. Opcional: aplicar **2-opt swap** para mejorar la ruta (simple, pocas iteraciones)
5. Actualizar campo `orden` en cada Ruta

### Por qué Nearest Neighbor primero

| Opción | Complejidad | Dependencias | Resultado |
|--------|------------|-------------|-----------|
| Nearest Neighbor + haversine | Baja | Ninguna (TypeScript puro) | ~15-20% sobre óptimo |
| 2-opt improvement | Media | Ninguna (TypeScript puro) | ~5-10% sobre óptimo |
| google/or-tools | Alta | `node-or-tools` (C++ bindings) | Óptimo garantizado |
| pgRouting + PostGIS | Alta | PostGIS extension | Óptimo en DB |

**Recomendación**: Nearest Neighbor + haversine en TypeScript. 0 dependencias externas, implementación trivial, y da un orden sensible desde el día 1. Se puede mejorar después.

### Consideraciones

- Las tareas sin coordenadas (`medidorId` nulo o medidor sin lat/lng) van al final del orden
- El orden se recalcula cuando:
  - Se agrega una tarea nueva en la zona
  - Se elimina/cancela una tarea
  - (Opcional) Batch nocturno que reordena todo
- Ejecutar como operación asíncrona (job con pg-boss)

## Decisiones abiertas

1. ~~Orden dentro de la zona~~ → **Automático por coordenadas (resuelto)**
2. ~~Límite de tareas por operador~~ → **Sin límite (resuelto)**
3. **Notificaciones**: ¿push/webhook al operador cuando se le asigna una tarea nueva?
4. **Historial de reasignaciones**: ¿trackear cuando una tarea cambia de operador?

## Non-goals (para esta iteración)

- No se reemplaza `Rutas` — solo se extiende con campos nuevos
- No se cambia el modelo de períodos
- No se agrega planificador automático de rutas (por ahora)
- No se agrega mapa/geolocalización en tiempo real
- No se notifica al operador en tiempo real (push/webhook)
