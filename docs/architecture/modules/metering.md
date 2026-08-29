# 💧 Metering Context

## Responsabilidad
El **Core** del sistema. Se encarga de todo lo relacionado con la medición del consumo de agua y los dispositivos físicos (medidores).

## Contenido
- **`readings/`**: Registro, validación y gestión de lecturas de consumo.
- **`meter/`**: Inventario y estado de los medidores instalados.

---

## 📐 Estándar RESTful - Endpoints

### Meter Controller (`/meters`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/meters` | Crear un nuevo medidor |
| `GET` | `/meters` | Listar todos los medidores (con paginación) |
| `GET` | `/meters/:id` | Obtener un medidor específico |
| `PATCH` | `/meters/:id` | Actualizar un medidor |
| `DELETE` | `/meters/:id` | Eliminar un medidor (soft delete) |
| `POST` | `/meters/:id/install` | Instalar medidor en contrato |
| `POST` | `/meters/:id/decommission` | Dar de baja un medidor |
| `POST` | `/meters/:id/report-defect` | Reportar daño de un medidor |

### Reading Controller (`/readings`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/readings` | Listar todas las lecturas |
| `GET` | `/readings/:id` | Obtener una lectura específica |
| `PATCH` | `/readings/:id` | Actualizar una lectura |
| `DELETE` | `/readings/:id` | Eliminar una lectura |

### Histórico / Legacy — no es contrato vigente

En SC-283 se retiró `POST /readings` standalone, asociado históricamente a `CreateReadingUseCase`. Las lecturas se generan dentro de rutas u órdenes de trabajo; para actualizar una lectura se usa `PATCH /readings/:id` o `PATCH /operator/readings/:id`.

La foto normal de una lectura de campo se almacena en `OrdenesTrabajo.evidenciaFotoUrl` como clave de objeto RustFS. `LecturaAnomalia.fotoUrl` se reserva para evidencia de anomalías.

### Query Parameters

```text
GET /meters?skip=0&take=10&estado=BODEGA
GET /readings?skip=0&take=10&contratoId=1
```

| Parámetro | Descripción |
|------------|-------------|
| `skip` | Número de registros a omitir |
| `take` | Límite de registros a retornar |
| `estado` | Filtrar por estado (meters) |
| `contratoId` | Filtrar por contrato (readings) |

---

## 📅 Formato de Fechas

### Estándar
Todas las fechas en la API usan formato **ISO 8601**:

| Campo | Formato | Ejemplo |
|-------|---------|---------|
| `fecha` | `YYYY-MM-DD` | `"2024-01-15"` |
| `createdAt` | `ISO 8601` | `"2024-01-15T10:30:00Z"` |
| `updatedAt` | `ISO 8601` | `"2024-01-15T14:45:00Z"` |
| `deletedAt` | `ISO 8601` o `null` | `"2024-01-20T09:00:00Z"` |
| `fechaInstalacion` | `ISO 8601` o `null` | `"2024-02-01T08:00:00Z"` |
| `fechaBaja` | `ISO 8601` o `null` | `null` |

### Input (DTOs)
- Las fechas de **entrada** se envían como `string` en formato `YYYY-MM-DD` o `ISO 8601`
- El servidor convierte a `Date` internamente usando `new Date(fechaString)`

### Output (Entities)
- Las fechas de **respuesta** se devuelven como strings ISO 8601
- Los timestamps incluyen timezone (`Z` = UTC)

### Ejemplo Request/Response

```json
// POST /meters
{
  "marca": "Itron",
  "modelo": "CX1000",
  "serie": "SN-2024-001234",
  "latitud": -33.4489,
  "longitud": -70.6693
}

// Response
{
  "medidorId": "1",
  "contratoId": null,
  "marca": "Itron",
  "modelo": "CX1000",
  "serie": "SN-2024-001234",
  "estado": "BODEGA",
  "fechaInstalacion": null,
  "fechaBaja": null,
  "motivo": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "deletedAt": null,
  "latitud": -33.4489,
  "longitud": -70.6693
}
```

---

## 🔒 DTOs de Respuesta

Los DTOs de respuesta definen exactamente qué campos se retornan en la API:

### MeterResponseDto
- Usa `safeMeterSelect` en el service para filtrar campos a nivel SQL
- Excluye: `deletedAt`, `createdAt`, `updatedAt` (campos internos)
- Incluye: todos los campos públicos del medidor

### LecturaResponseDto
- Similar patrón de filtrado
- Campos públicos específicos del dominio

---

## Estados de Medidor

| Estado | Descripción |
|--------|-------------|
| `BODEGA` | Medidor en inventario, sin instalar |
| `INSTALADO` | Medidor instalado en un contrato |
| `DANADO` | Medidor reportado con daño |
| `PENDIENTE` | Medidor pendiente de acción |
| `BAJA` | Medidor dado de baja |

## Screaming Architecture
Esta carpeta "grita" que estamos ante un sistema de gestión hídrica. Es el dominio más importante y debe estar protegido de cambios en otros contextos.
