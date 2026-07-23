# Flujo: Portal Público

> Estado: documenta el código **tal como está implementado** en `backend/src/public-portal/`, no el diseño deseado. Fecha de referencia: 2026-07.

## Resumen

`public-portal/` es la **única** superficie del backend pensada para un actor no autenticado. Todo el resto de controladores queda protegido por los guards globales (`JwtAuthGuard` + `PermissionsGuard`, ver [autenticacion.md](./autenticacion.md)) salvo que se marque explícitamente `@Public()` — este módulo es el caso de uso real de esa excepción, junto con los propios endpoints de `auth/`.

Sub-dominio único: `search/` (búsqueda pública de deuda).

## Endpoint

`GET /search` — `BusquedaPublicaController` (`backend/src/public-portal/search/interfaces/http/busqueda-publica.controller.ts`):

- `@Public()` — bypassa `JwtAuthGuard`.
- `@UseGuards(ThrottlerGuard)` + `@Throttle({ limit: 10, ttl: 60000 })` — 10 requests/min por IP, más estricto que el throttle global (20/min), para dificultar scraping masivo de datos de clientes.
- Query params: `tipo`, `valor`, `page`, `limit`.

## Lógica (`SearchDeudaPublicaUseCase`)

1. Valida que `valor` (el término de búsqueda) no esté vacío.
2. Limita `limit` a un máximo de 50 y `page` a mínimo 1.
3. Si `tipo === 'numeroGuia'`: busca directamente por número de guía, trae los contratos que matchean y los **agrupa por cliente** en la respuesta.
4. Cualquier otro `tipo`: busca clientes (por identificación/nombre según el repositorio) y devuelve sus contratos anidados.
5. Por cada contrato devuelto, calcula (`DebtCalculatorHelper`, a partir de las prefacturas impagadas del contrato):
   - `saldoVencido`
   - `deudaAnterior`
   - `mesesAtrasado`

La respuesta expone nombre del cliente, identificación, y por contrato: `numeroGuia`, `estado`, y el resumen de deuda — **no** expone montos de detalle, historial de pagos ni datos sensibles adicionales.

## Qué puede hacer un actor no autenticado

- Consultar si un cliente/contrato tiene deuda pendiente y desde cuándo, dado que conozca su identificación, nombre o número de guía.
- Nada más: no puede pagar, no puede descargar PDFs, no puede ver comprobantes — este módulo es de solo lectura y de un único propósito (consulta de deuda).

## Archivos clave

- `backend/src/public-portal/search/interfaces/http/busqueda-publica.controller.ts`
- `backend/src/public-portal/search/application/use-cases/search-deuda-publica.use-case.ts`
- `backend/src/shared/utils/debt-calculator.util.ts`
- `docs/architecture/modules/public-portal.md`
