# Flujo: Envío de Correo y Notificaciones

> Estado: documenta el código **tal como está implementado** en `backend/src/infrastructure/mail/`, no el diseño deseado. Fecha de referencia: 2026-07. Ver también el README propio del módulo: `backend/src/infrastructure/mail/README.md` (más detallado que este documento en varios puntos).

## Resumen

Infraestructura transversal de envío de correo, pensada para distribución masiva de "planillas" (prefacturas) — del orden de ~5.000 correos/mes — sobre cola PostgreSQL (`pg-boss`, sin Redis) y con failover entre proveedores SMTP.

## Componentes

| Componente | Rol |
|---|---|
| `MailService` | Fachada. `send()` síncrono (bypassa la cola) y `sendPlanilla()` / `sendBatchPlanillas()` asíncronos (encolan vía `pg-boss`). |
| `MailQueueService` | Integra `pg-boss`; encola/procesa el job `send-mail`. |
| `MailProviderFactory` + dispatchers (`failover.dispatcher.ts`, `round-robin.dispatcher.ts`) | Selección de proveedor SMTP, reintentos, connection pooling. |
| `MailRateLimitService` | Cuota diaria por proveedor, control atómico contra `mail_provider_daily_counts`. |
| `MailMetricsController` | `GET /mail/metrics` — salud de la cola en tiempo real. |
| `templates/*.hbs` | Handlebars: `base.hbs`, `generic-report.hbs`, `planilla.hbs`. |

## Envío asíncrono (caso principal)

1. Un caller (p. ej. `SendPreInvoiceByEmailUseCase` en billing, `SendReportByEmailUseCase` en reports) llama a `MailService.sendPlanilla(...)` o equivalente.
2. `MailQueueService` encola un job `send-mail` en `pg-boss` (schema `jobs` de PostgreSQL).
3. Política de reintentos: **3 intentos**, backoff exponencial, delay inicial 5s, delay máximo 300s.
4. Envíos masivos (`sendBatchPlanillas`, usado por `SendBatchEmailsUseCase` de `billing/batch`) segmentan los destinatarios en bloques de ~25 (`queueBulkMails`) para no saturar memoria ni red.

## Selección de proveedor y cuotas

1. **Brevo** como proveedor primario (carga transaccional principal, límite diario estricto).
2. **Gmail/Hostinger** como contingencia (`fallback`) exclusiva.
3. Antes de abrir la conexión SMTP, `MailRateLimitService` ejecuta un `INSERT ... ON CONFLICT` atómico contra `mail_provider_daily_counts` para reservar cupo; si el proveedor está agotado, la fábrica rota inmediatamente al siguiente.
4. Si el proveedor falla por un error de red genuino durante el handshake SMTP, el cupo reservado se libera (no se descuenta una cuota que nunca se usó realmente).
5. Cada transporte SMTP usa un *connection pool* de máximo 5 conexiones concurrentes.

## Plantillas y seguridad

Handlebars con dos contextos deliberadamente distintos:

- `{{variable}}` — escape HTML automático, obligatorio para cualquier dato proveniente de usuario o BD (nombres, observaciones, etc.).
- `{{{variable}}}` — sin escape, reservado exclusivamente para bloques HTML generados por el propio backend y de confianza absoluta (nunca para texto libre de un usuario).

## Observabilidad

`GET /mail/metrics` expone, consultando directo contra PostgreSQL: conteos por estado (completados/pendientes/fallidos) y los últimos 50 jobs procesados por la cola.

## Quiénes lo usan

- `billing/pre-invoice` → `SendPreInvoiceByEmailUseCase` (una planilla).
- `billing/batch` → `SendBatchEmailsUseCase` (todas las planillas de un lote).
- `reports/` → `SendReportByEmailUseCase` (reportes PDF por correo).

Nota: los **webhooks salientes** de `sri/webhooks/` (notificaciones de autorización/rechazo SRI a terceros) son un mecanismo separado, HTTP + HMAC sobre su propia cola pg-boss (`webhook-dispatch`), no pasan por `infrastructure/mail`. Ver [facturacion-electronica-sri.md](./facturacion-electronica-sri.md).

## Archivos clave

- `backend/src/infrastructure/mail/README.md` — documento de referencia más extenso, mantenido junto al código.
- `backend/src/infrastructure/mail/application/mail.service.ts`
- `backend/src/infrastructure/mail/infrastructure/queue/mail-queue.service.ts`
- `backend/src/infrastructure/mail/infrastructure/rate-limit/mail-rate-limit.service.ts`
- `backend/src/infrastructure/mail/infrastructure/providers/provider.factory.ts`
- `backend/src/infrastructure/mail/interfaces/http/mail-metrics.controller.ts`
