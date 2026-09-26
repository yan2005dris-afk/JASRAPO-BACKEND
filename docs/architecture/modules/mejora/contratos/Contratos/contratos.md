# Contratos

Vínculo entre cliente, medidor, tarifa y servicio.

## Alcance y entradas HTTP

- **Controlador:** `ContratoMedidorController`.
- **Servicio:** `ContratoMedidorService`.
- **Casos:** `CreateContractUseCase`, `FindAllContractsUseCase`, `FindOneContractUseCase`, `UpdateContractUseCase`, `FinalizeMeterLinkUseCase`, `RemoveContractUseCase`.
- La asignación de ruta usa el servicio/repositorios; no se confirmó un caso de uso dedicado.

| Método y ruta | Caso/servicio ejecutado | Resultado |
|---|---|---|
| `POST /api/v1/contracts` | `crearContrato()` → `CreateContractUseCase.execute()` | Contrato creado. |
| `GET /api/v1/contracts` | `buscarContratos()` → `FindAllContractsUseCase.execute()` | Página. |
| `GET /api/v1/contracts/:id` | `buscarContrato()` → `FindOneContractUseCase.execute()` | Detalle. |
| `PATCH /api/v1/contracts/:id` | `actualizar()` → `UpdateContractUseCase.execute()` | Contrato actualizado. |
| `POST /api/v1/contracts/:id/finalize` | `finalizarVinculo()` → `FinalizeMeterLinkUseCase.execute()` | Vínculo finalizado. |
| `POST /api/v1/contracts/:id/assign-installation-route` | `assignInstallationRoute()` → servicio/repositorios | Ruta y orden de instalación. |
| `DELETE /api/v1/contracts/:id` | `eliminar()` → `RemoveContractUseCase.execute()` | Soft delete. |
| `GET /api/v1/contracts/:id/pdf/connection-request` | `generateConnectionRequestPdf()` | PDF. |
| `GET /api/v1/contracts/:id/pdf/responsibility-agreement` | `generateResponsibilityAgreementPdf()` | PDF. |

## Ejemplo JSON

```json
{
  "contratoId": "1",
  "clienteId": "10",
  "medidorId": "20",
  "estadoServicio": "PENDIENTE_PAGO",
  "estadoCobranza": "NO_APLICA"
}
```

| Campo | Tipo | Regla/uso |
|---|---|---|
| `contratoId`, `clienteId`, `medidorId` | string | `BigInt` serializado. |
| `categoriaTarifaId`, `comunidadId`, `sectorId` | number | Relaciones territoriales/tarifarias. |
| `numeroGuia`, `direccionSuministro` | string | Datos de instalación. |
| `estadoServicio` | enum | Ciclo operativo del servicio. |
| `estadoCobranza` | enum | Situación de cobro. |
| `latitud`, `longitud` | number \| null | Ubicación del predio (WGS84, `latitud` en [-90,90], `longitud` en [-180,180]). Opcionales: se envían ambas o ninguna. En `PATCH`, un valor `null` explícito limpia el par; si se omiten, se conserva el valor almacenado. |

## Estados

| Dimensión | Valores confirmados | Significado |
|---|---|---|
| Servicio | `PENDIENTE_PAGO`, `PENDIENTE_INSTALACION`, `ACTIVO`, `SUSPENDIDO`, `RETIRADO` | Pago, instalación, operación, suspensión y retiro. |
| Cobranza | `NO_APLICA`, `AL_DIA`, `EN_MORA` | Sin cobro, corriente o vencido. |

## Efectos y transacciones

La creación valida relaciones y puede crear contrato, historial de medidor, prefactura y detalle. El reemplazo en `PATCH` y la finalización escriben vínculo/historial según el caso. La asignación crea o reutiliza una ruta y crea una orden; el código no confirma una transacción única para ambas escrituras. DELETE usa soft delete. Los DTO y la generación de PDF son transformaciones/serialización puras.

| Tabla Prisma | Uso |
|---|---|
| `Contratos` | Contrato, estados y soft delete. |
| `HistorialMedidores` | Historial del vínculo. |
| `Medidores` | Medidor asociado. |
| `CategoriaTarifa`, `Clientes` | Relaciones principales. |
| `Prefacturas`, `PrefacturaDetalle`, `Rubros` | Cargo de instalación. |
| `Rutas`, `OrdenTrabajo` | Instalación asignada. |

## Gráfico de estados

```mermaid
stateDiagram-v2
  [*] --> PENDIENTE_PAGO
  PENDIENTE_PAGO --> PENDIENTE_INSTALACION: pago de instalación
  PENDIENTE_INSTALACION --> ACTIVO: confirmación operativa
  ACTIVO --> SUSPENDIDO
  SUSPENDIDO --> RETIRADO
```

## Casos de uso

### Caso: Crear contrato

**Descripción:** crea el contrato y prepara la instalación del medidor.  
**HTTP y ruta:** `POST /api/v1/contracts`.  
**Permiso:** `contracts:create`.  
**Cadena:** `ContratoMedidorController.crear()` → `ContratoMedidorService.crearContrato()` → `CreateContractUseCase.execute()` → repositorios.  
**Errores relevantes:** `400` datos/relaciones inválidas; `401`; `403`; `404`; medidor no disponible.  
**Efectos:** crea contrato, historial y prefactura en las operaciones confirmadas por el caso.  
**Prisma:** `Contratos`, `HistorialMedidores`, `Medidores`, `Prefacturas`, `PrefacturaDetalle`, `Rubros`, `Clientes`, `CategoriaTarifa`.  
**Entrada:**

```json
{"clienteId":"10","medidorId":"20","categoriaTarifaId":1,"numeroGuia":"G-0001","direccionSuministro":"Av. Amazonas 123","comunidadId":1,"latitud":-1.7966,"longitud":-80.7568}
```

`latitud`/`longitud` son opcionales; si se omiten, el contrato se crea con ambas en `NULL`.

**Salida:**

```json
{"contratoId":"1","clienteId":"10","medidorId":"20","estadoServicio":"PENDIENTE_PAGO","estadoCobranza":"NO_APLICA","latitud":-1.7966,"longitud":-80.7568}
```

### Caso: Listar contratos

**Descripción:** devuelve contratos filtrados y paginados.  
**HTTP y ruta:** `GET /api/v1/contracts`.  
**Permiso:** `contracts:read`.  
**Cadena:** `ContratoMedidorController.buscarContratos()` → `ContratoMedidorService.buscarContratos()` → `FindAllContractsUseCase.execute()` → repositorio.  
**Errores relevantes:** `400` query inválida; `401`; `403`.  
**Efectos:** ninguno; consulta y DTO puros.  
**Prisma:** `Contratos`, `Clientes`, `Medidores`, `CategoriaTarifa`.  
**Entrada:** sin body; query del `FilterContractsDto` (paginación y filtros definidos por el DTO).  
**Salida:**

```json
{"data":[{"contratoId":"1","estadoServicio":"ACTIVO"}],"meta":{"page":1,"limit":10,"total":1,"totalPages":1}}
```

### Caso: Obtener contrato

**Descripción:** consulta el detalle de un contrato.  
**HTTP y ruta:** `GET /api/v1/contracts/:id`.  
**Permiso:** `contracts:read`.  
**Cadena:** `ContratoMedidorController.buscarContrato()` → `ContratoMedidorService.buscarContrato()` → `FindOneContractUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** ninguno; mapeo puro.  
**Prisma:** `Contratos`, `Clientes`, `Medidores`, `CategoriaTarifa`, `HistorialMedidores`.  
**Entrada:** sin body; path `{ "id": "1" }`.  
**Salida:**

```json
{"contratoId":"1","clienteId":"10","estadoServicio":"ACTIVO","estadoCobranza":"AL_DIA","latitud":-1.7966,"longitud":-80.7568,"historialMedidores":[]}
```

### Caso: Actualizar contrato

**Descripción:** actualiza estados, dirección, sector o reemplaza el medidor si se envía `medidorId`.  
**HTTP y ruta:** `PATCH /api/v1/contracts/:id`.  
**Permiso:** `contracts:update`.  
**Cadena:** `ContratoMedidorController.actualizarContrato()` → `ContratoMedidorService.actualizar()` → `UpdateContractUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`; conflicto de estado/relación.  
**Efectos:** actualización; el reemplazo indicado se ejecuta transaccionalmente según el caso.  
**Prisma:** `Contratos`, `Medidores`, `HistorialMedidores`.  
**Entrada:** path `{ "id": "1" }`; body `{ "direccionSuministro": "Calle Nueva 10" }`. Para fijar la ubicación: `{ "latitud": -1.7966, "longitud": -80.7568 }`; para limpiarla: `{ "latitud": null, "longitud": null }`. Enviar solo una de las dos coordenadas se rechaza con `400`.  
**Salida:**

```json
{"contratoId":"1","direccionSuministro":"Calle Nueva 10","estadoServicio":"ACTIVO","latitud":null,"longitud":null}
```

### Caso: Finalizar vínculo de medidor

**Descripción:** finaliza el vínculo activo del contrato con su medidor.  
**HTTP y ruta:** `POST /api/v1/contracts/:id/finalize`.  
**Permiso:** `contracts:update`.  
**Cadena:** `ContratoMedidorController.finalizarVinculo()` → `ContratoMedidorService.finalizarVinculo()` → `FinalizeMeterLinkUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** registra el cierre en el historial.  
**Prisma:** `HistorialMedidores`, `Contratos`, `Medidores`.  
**Entrada:** sin body; path `{ "id": "1" }`.  
**Salida:**

```json
{"contratoId":"1","fechaFin":"2026-09-16"}
```

### Caso: Asignar ruta de instalación

**Descripción:** asigna un contrato pendiente de instalación a una ruta existente o crea una ruta de instalación y su orden.  
**HTTP y ruta:** `POST /api/v1/contracts/:id/assign-installation-route`.  
**Permiso:** `contracts:update`.  
**Cadena:** `ContratoMedidorController.assignInstallationRoute()` → `ContratoMedidorService.assignInstallationRoute()` → repositorios de rutas/órdenes.  
**Errores relevantes:** `400`; `401`; `403`; `404`; ruta destino inválida.  
**Efectos:** crea/reutiliza `Rutas` y crea `OrdenTrabajo`; no se confirma atomicidad de ambas escrituras.  
**Prisma:** `Rutas`, `OrdenTrabajo`, `Contratos`, `Medidores`.  
**Entrada:** path `{ "id": "1" }`; body `{ "routeId": "42" }` o DTO sin `routeId` según el código.  
**Salida:**

```json
{"rutaId":"42","tipoRuta":"INSTALACION","ordenesTrabajo":[{"ordenTrabajoId":"9","estado":"PENDIENTE"}]}
```

### Caso: Eliminar contrato

**Descripción:** marca el contrato como eliminado lógicamente.  
**HTTP y ruta:** `DELETE /api/v1/contracts/:id`.  
**Permiso:** `contracts:delete`.  
**Cadena:** `ContratoMedidorController.eliminarContrato()` → `ContratoMedidorService.eliminar()` → `RemoveContractUseCase.execute()` → repositorio.  
**Errores relevantes:** `400`; `401`; `403`; `404`.  
**Efectos:** soft delete en `Contratos`.  
**Prisma:** `Contratos`.  
**Entrada:** sin body; path `{ "id": "1" }`.  
**Salida:**

```json
{"contratoId":"1","estadoServicio":"ACTIVO","estadoCobranza":"AL_DIA"}
```

### Caso: Generar PDF de solicitud de conexión

**Descripción:** genera la solicitud oficial de conexión.  
**HTTP y ruta:** `GET /api/v1/contracts/:id/pdf/connection-request`.  
**Permiso:** `contracts:read`.  
**Cadena:** `ContratoMedidorController.connectionRequestPdf()` → `ContratoMedidorService.generateConnectionRequestPdf()` → `GetConnectionRequestPdfDataUseCase` → generador.  
**Errores relevantes:** `400`; `401`; `403`; `404`; aborto de solicitud.  
**Efectos:** sólo lectura y proyección; serialización PDF pura.  
**Prisma:** `Contratos`, `Clientes`, `Medidores`, `CategoriaTarifa`.  
**Entrada:** sin body; path `{ "id": "1" }`.  
**Salida:** no es JSON: `Content-Type: application/pdf`, `Content-Disposition: inline` y `Content-Length`, con bytes PDF.

### Caso: Generar PDF de acuerdo de responsabilidad

**Descripción:** genera el acta de responsabilidad asociada al contrato.  
**HTTP y ruta:** `GET /api/v1/contracts/:id/pdf/responsibility-agreement`.  
**Permiso:** `contracts:read`.  
**Cadena:** `ContratoMedidorController.responsibilityAgreementPdf()` → `ContratoMedidorService.generateResponsibilityAgreementPdf()` → `GetResponsibilityAgreementPdfDataUseCase` → generador.  
**Errores relevantes:** `400`; `401`; `403`; `404`; aborto de solicitud.  
**Efectos:** no se confirma escritura de dominio; proyección y PDF puros.  
**Prisma:** `Contratos`, `Clientes`, `Medidores`, `HistorialMedidores`.  
**Entrada:** sin body; path `{ "id": "1" }`.  
**Salida:** no es JSON: `application/pdf`, `Content-Disposition: inline`, `Content-Length` y bytes PDF.

## Reversión manual SC-322

La migración `20260925000000_move_coordinates_to_contratos` movió `latitud`/`longitud` de `medidores` a `contratos` (ver `docs/architecture/SQL_PRISMA_ALIGNMENT.md` para la restricción CHECK `contratos_coordenadas_chk`). Si se necesita revertir manualmente en un entorno donde ya se aplicó:

```sql
ALTER TABLE "medidores" ADD COLUMN "latitud" DECIMAL(10,8), ADD COLUMN "longitud" DECIMAL(11,8);

UPDATE "medidores" m
SET "latitud" = c."latitud", "longitud" = c."longitud"
FROM "historial_medidores" h
JOIN "contratos" c ON c."contrato_id" = h."contrato_id"
WHERE h."medidor_id" = m."medidor_id" AND h."fecha_hasta" IS NULL AND h."borrado_en" IS NULL;

ALTER TABLE "contratos" DROP CONSTRAINT IF EXISTS "contratos_coordenadas_chk",
  DROP COLUMN "latitud", DROP COLUMN "longitud";

DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260925000000_move_coordinates_to_contratos';
```

Luego desplegar el código anterior a esta migración. No es recuperable con este script: coordenadas ingresadas en contratos sin vínculo de medidor abierto, y coordenadas originales de medidores sin vínculo (bodega/retirados); esos casos requieren el respaldo previo al despliegue.

## No documentado o pendiente de confirmar

- Transición automática a `ACTIVO` al completar instalación.
- Parámetros exactos de los DTO de finalización/asignación si cambian.
- Sincronización del campo legacy `estado`.
