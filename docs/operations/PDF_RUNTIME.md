# Operación de generación PDF

## Frontera operativa

Los PDF oficiales se renderizan en el backend mediante Handlebars y Puppeteer.
`PdfService` aplica una capacidad total de `PDF_CONCURRENCY +
PDF_MAX_QUEUE_SIZE`; una solicitud que excede esa capacidad recibe HTTP 503 con
`code=PDF_QUEUE_SATURATED`, `retryable=true` y `retryAfterSeconds`.

El presupuesto `PDF_TOTAL_TIMEOUT_MS` comienza antes de la admisión e incluye
espera, apertura de página, carga de HTML y renderizado. Al expirar o cancelarse
la conexión HTTP, el resultado se descarta y la página se cierra. La recuperación
del navegador usa una sola promesa compartida para impedir relanzamientos en
carrera.

## Configuración inicial

| Variable                         |  Default | Responsabilidad                     |
| -------------------------------- | -------: | ----------------------------------- |
| `PDF_CONCURRENCY`                |        4 | Renderizados activos máximos        |
| `PDF_MAX_QUEUE_SIZE`             |       32 | Esperas máximas antes de rechazar   |
| `PDF_TOTAL_TIMEOUT_MS`           |    30000 | Presupuesto total por solicitud     |
| `PDF_RETRY_AFTER_SECONDS`        |        5 | Espera sugerida tras saturación     |
| `PDF_EMAIL_MAX_ATTACHMENT_BYTES` | 10485760 | Límite de adjunto (10 MiB)          |
| `PDF_EMAIL_IDEMPOTENCY_SECONDS`  |    86400 | Ventana idempotente (24 h)          |
| `PDF_EMAIL_JOB_TIMEOUT_SECONDS`  |      120 | Expiración del worker de generación |

Los endpoints de correo admiten `idempotencyKey` UUID v4. La petición encola
`generate-report-email`; ese worker obtiene datos canónicos, genera el PDF,
valida el tamaño y encola `send-mail`. Ambos jobs usan la misma identidad lógica,
por lo que un reintento no vuelve a entregar el correo.

## Métricas Prometheus

- `pdf_queue_depth`
- `pdf_active_renders`
- `pdf_queue_wait_duration_seconds{document_type}`
- `pdf_render_duration_seconds{document_type,status}`
- `pdf_total_duration_seconds{document_type,status}`
- `pdf_timeouts_total{document_type}`
- `pdf_rejections_total{document_type}`
- `pdf_cancellations_total{document_type}`
- `pdf_browser_restarts_total`
- `pdf_process_memory_bytes{kind}`
- `pdf_process_cpu_seconds{mode}`

El endpoint `/health/pdf` conserva los contadores operativos inmediatos y expone
capacidad, cola, reinicios, memoria y CPU del proceso.

## Perfil de carga acordado

El SRS exige un PDF individual en menos de 5 segundos y operación estable sobre
2 vCPU/4 GB. En staging, con datos representativos, ejecutar:

```bash
BASE_URL=http://localhost:3000/api/v1 \
ACCESS_TOKEN=<token> CONTRATO_ID=1 \
pnpm run test:load:pdf
```

El perfil usa 5 usuarios concurrentes durante un minuto y falla si:

- p95 de respuesta es mayor o igual a 5 segundos;
- errores o rechazos por saturación alcanzan 1%;
- menos del 99% de las verificaciones son correctas.

## Disparadores para evaluar extracción

No se introduce un microservicio automáticamente. Se abre una evaluación si
cualquiera de estas condiciones permanece durante 15 minutos en producción:

- CPU del backend superior al 80%;
- RSS superior al 80% de los 4 GB disponibles;
- cola PDF p95 superior al 80% de `PDF_MAX_QUEUE_SIZE`;
- timeout o rechazo PDF igual o superior al 1%;
- latencia total PDF p95 superior a 5 segundos;
- reinicios de navegador repetidos (más de 3 en 15 minutos).

Antes de aumentar concurrencia se repite el perfil de carga, se compara CPU,
memoria, p95/p99, cola y tasa de error, y se conserva la configuración anterior
como rollback.
