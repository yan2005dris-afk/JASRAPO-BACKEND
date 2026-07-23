# Flujo: Operaciones (Relación Comercial y Territorio)

> Estado: documenta el código **tal como está implementado** en `backend/src/operations/`, no el diseño deseado. Fecha de referencia: 2026-07.

## Resumen

`operations/` es el módulo de datos maestros de la relación comercial: quién es cliente, qué contrato de servicio tiene, en qué comunidad/sector vive y qué ruta de lectura le corresponde. No mueve dinero (eso es `billing/`) ni mide consumo (eso es `metering/`) — es la capa que ambos referencian por `clienteId`/`contratoId`/`comunidadId`.

Sub-dominios: `clients/`, `contracts/`, `communities/`, `sectors/`, `routes/`.

Todos siguen el mismo patrón hexagonal descrito en `docs/architecture/ARCHITECTURE.md` ("Anatomía de un Sub-dominio"): `application/<entidad>.service.ts` + `use-cases/`, `domain/repositories/<entidad>.repository.ts` (puerto), `infrastructure/repositories/prisma-<entidad>.repository.ts` (adaptador), `interfaces/http/<entidad>.controller.ts`.

## 1. Clientes (`clients/`)

CRUD estándar (`ClientController`): crear, buscar, actualizar, soft-delete. Cada cliente tiene datos de identificación (tipo + número) y flags que otros módulos leen directamente, por ejemplo `aplica_tercera_edad` / `aplica_discapacidad` — usados por `generar_prefacturas_lote` (billing) para decidir descuentos automáticos.

## 2. Contratos (`contracts/`)

Un contrato es el vínculo legal cliente ↔ medidor ↔ categoría de tarifa ↔ territorio. `CreateContractUseCase.execute`:

```ts
contractRepository.createContractWithMeterHistory({
  clienteId, categoriaTarifaId, medidorId, comunidadId, sectorId,
  numeroGuia, direccionSuministro,
  estado: dto.estado || EstadoContrato.SOLICITUD,
  creadoPor, lecturaInicial: dto.lecturaInicial ?? 0,
})
```

Un único método de repositorio crea el contrato **y** la entrada correspondiente en el historial de medidores en la misma operación — el use-case no orquesta pasos separados. El estado por defecto de un contrato nuevo es `SOLICITUD` (no `ACTIVO`); `generar_prefacturas_lote` solo procesa contratos en estado `ACTIVO`, así que un contrato recién creado no se factura hasta que pase por su propia activación.

## 3. Territorio (`communities/`, `sectors/`)

`communities/` (comunidades/barrios) y `sectors/` (subdivisión dentro de una comunidad) son catálogos jerárquicos usados para filtrar y agrupar: `POST /batches/generate` acepta un `comunidadId` opcional para limitar la generación de un lote a una sola comunidad. La comunidad también almacena `porcentaje_tasa_seguridad`, leído por `generar_prefacturas_lote`.

## 4. Rutas (`routes/`)

Organiza contratos/medidores en rutas de lectura y distribución, usadas para asignar el trabajo de campo que consume `metering/operator` (`GET /operator/tasks`, `GET /operator/readings`).

## Relación con otros módulos

- `metering/` referencia `contratoId`/`medidorId` de este módulo pero no los gestiona.
- `billing/` lee `categoria_tarifa`, `comunidad.porcentaje_tasa_seguridad` y los flags de descuento del cliente al generar prefacturas.
- `public-portal/search` busca clientes y contratos de este módulo para exponer deuda públicamente (sin autenticación).

## Archivos clave

- `backend/src/operations/clients/interfaces/http/client.controller.ts`
- `backend/src/operations/contracts/application/use-cases/create-contract.use-case.ts`
- `backend/src/operations/communities/`
- `backend/src/operations/sectors/`
- `backend/src/operations/routes/`
- `docs/architecture/modules/operations.md`
