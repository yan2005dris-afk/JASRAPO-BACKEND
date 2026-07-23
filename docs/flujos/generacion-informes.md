# Flujo: Generación de Informes (Módulo `reports/`)

> Estado: documenta el código **tal como está implementado** en `backend/src/reports/`, no el diseño deseado. Fecha de referencia: 2026-07.

## Resumen

El módulo `reports/` genera documentos PDF operativos/financieros (Puppeteer + `pdf-lib`), con negociación de contenido JSON/PDF y despacho por correo. Todos los endpoints están protegidos por `JwtAuthGuard` + `PermissionsGuard` + `@RequiredPermission('reportes', 'read')` — no hay superficie pública en este módulo.

## Endpoints (`ReportsController`)

Reducido de 10 a 5 endpoints de descarga tras una consolidación (`report-style-system-config`, ver comentario en el propio controlador):

| Endpoint | Fuente de datos | Ruta de render |
|---|---|---|
| `GET /reports/payments-report` | `PaymentsReportSpec.fetchData` | `ReportStyleDispatcher` (estilo configurable) |
| `GET /reports/connection-history` | `ConnectionHistoryReportSpec.fetchData` | `ReportStyleDispatcher` |
| `GET /reports/payment-agreement` | `GetPaymentAgreementPdfDataUseCase.execute` | `ReportStyleDispatcher` |
| `GET /reports/clients-list` | `ClientsListReportSpec.fetchData` | `GeneratePdfUseCase.execute('clients-list', data)` directo |
| `GET /reports/account-statement` | `AccountStatementReportSpec.fetchData` | `GeneratePdfUseCase.execute('account-statement', data)` directo |

Los tres primeros ("consolidados") resuelven el **estilo** de salida (`legacy` | `modern`) en tiempo de request desde `sistema_config` (clave `reporte.estilo`) vía `ReportStyleDispatcher.dispatch(reportType, data)`, que despacha al `pdf-type`/factory correspondiente. Los dos últimos ("sin tocar") llaman directo a `GeneratePdfUseCase`, sin variante de estilo.

## Negociación de contenido

Un mismo endpoint sirve JSON o PDF según el header `Accept` (`respondWithContentNegotiation`, privado en el controller):

- `Accept: application/pdf` (y **solo** ese valor, sin combinarlo con otros tipos) → responde el binario PDF.
- Cualquier otra cosa — header ausente, `*/*`, `application/json`, o una lista mixta — → responde JSON con los mismos datos crudos que alimentan el PDF (serialización BigInt-safe manual, porque el uso de `@Res()` evita el interceptor global de BigInt).

Esto significa que el mismo caso de uso (`fetchData` + spec) sirve tanto a un consumidor de API como a la descarga de PDF — no hay dos caminos de negocio distintos.

## Envío por correo

5 endpoints `POST /reports/<tipo>/email` (`payments-report`, `connection-history`, `payment-agreement`, `account-statement`, `clients`) validan el identificador requerido (`clienteId`/`contratoId`/`convenioId`/`destinatario` según el documento) y delegan en `SendReportByEmailUseCase.execute({ reportType, filters, destinatarioOverride, subjectOverride })`, que reutiliza el mismo pipeline de generación de PDF y lo despacha por `MailService` (cola asíncrona — ver [correo-notificaciones.md](./correo-notificaciones.md)) en vez de devolverlo en la respuesta HTTP.

## Documentos disponibles

- **Abonos** (`payments-report`) — pagos aplicados a facturas.
- **Historial de conexión** (`connection-history`) — historial de facturación por período de un contrato.
- **Convenio de pago** (`payment-agreement`) — documento del convenio (`billing/collections/agreements`).
- **Listado de clientes** (`clients-list`) — sin paginación, incluye todos los registros que matcheen el filtro.
- **Estado de cuenta** (`account-statement`) — por defecto últimos 6 períodos de un contrato, filtrable por rango de fechas.

## Archivos clave

- `backend/src/reports/interfaces/http/reports.controller.ts`
- `backend/src/reports/application/report-style.dispatcher.ts`
- `backend/src/reports/application/use-cases/send-report-by-email.use-case.ts`
- `backend/src/reports/specs/*.report-spec.ts`
- `backend/src/infrastructure/pdf/use-cases/generate-pdf.use-case.ts`
