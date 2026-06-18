# Módulo de Correo — Envío de Planillas Mensuales

Sistema de envío de correos para planillas de agua potable. Soporta envíos individuales y masivos (~5.000 planillas/mes), con cola asíncrona en PostgreSQL, fallback automático entre proveedores SMTP y PDF adjunto generado desde la prefactura.

---



## Arquitectura general

```text
┌─────────────────────────────────────────────────────────────────┐
│                        billing/pre-invoice                       │
│  SendPreInvoiceByEmailUseCase                                    │
│  SendBatchPreInvoicesByEmailUseCase                               │
│       │                                                          │
│       ├─► FindOnePreInvoiceUseCase   (datos de BD)              │
│       ├─► GeneratePreInvoicePdfUseCase (PDF = mismo que GET /pdf)│
│       └─► MailService.sendPlanilla()                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     infrastructure/mail                          │
│                                                                  │
│  MailService ──► MailQueueService ──► pg-boss (PostgreSQL)      │
│       │                    │                                     │
│       │                    └──► MailProviderFactory              │
│       │                              │                           │
│       └── send() síncrono            ├── Brevo (primario)        │
│                                      └── Gmail (fallback)        │
└─────────────────────────────────────────────────────────────────┘
```

| Componente | Responsabilidad |
|------------|-----------------|
| `SendPreInvoiceByEmailUseCase` | Orquesta el pipeline para una prefactura |
| `SendBatchPreInvoicesByEmailUseCase` | Procesa listas grandes en batches de 25 |
| `MailService` | API de alto nivel: `send()`, `sendPlanilla()`, `sendBatchPlanillas()` |
| `MailQueueService` | Encola y procesa jobs `send-mail` vía pg-boss |
| `MailProviderFactory` | Envío SMTP con fallback y rate limiting |
| `templates/planilla.hbs` | Cuerpo HTML del correo |

---

## Pipeline prefactura → PDF → email

Cuando se llama a `POST /pre-invoices/:id/send-email`:

1. **Buscar prefactura** por `prefacturaId` en la base de datos.
2. **Validar email** del cliente (`clienteEmail` o `contrato.cliente.email`).
3. **Generar PDF** con `GeneratePreInvoicePdfUseCase` — el mismo documento que devuelve `GET /pre-invoices/:id/pdf`.
4. **Encolar correo** con plantilla Handlebars + PDF adjunto.
5. **Worker pg-boss** procesa el job y envía vía SMTP (Brevo → Gmail si falla).

> **Importante:** El `:id` de la URL es el `prefacturaId`, no el `clienteId` ni el `contratoId`.

### Datos que usa el correo hoy

| Variable en plantilla | Origen en BD |
|-----------------------|--------------|
| `nombre` | `clienteNombre` o `contrato.cliente.nombres + apellidos` |
| `periodo` | `periodoRel.nombre` |
| `montoTotal` | `totalPagar` |
| `fechaEmision` | Fecha actual del servidor (pendiente: usar `createdAt`) |
| PDF adjunto | Reporte completo de la prefactura |

---

## Proveedores SMTP y fallback

Estrategia **primary + fallback**:

```text
Brevo (prioridad 1)  ──falla o límite──►  Gmail/Hostinger (prioridad 2)
```

| Proveedor | Variables `.env` | Límite free tier |
|-----------|------------------|------------------|
| **Brevo** (primario) | `BREVO_SMTP_USER`, `BREVO_SMTP_PASS` | 300 emails/día |
| **Gmail/Hostinger** (fallback) | `EMAIL_USER`, `EMAIL_PASSWORD` | 500 emails/día |

### Comportamiento

- Si Brevo falla (error SMTP), se intenta Gmail automáticamente en el mismo job.
- Si Brevo alcanza el límite diario (300), se salta y usa Gmail.
- Si Brevo no está configurado, se usa Gmail directamente.
- Si **ambos** fallan, pg-boss reintenta el job hasta **3 veces** con backoff exponencial.
- Los logs muestran qué proveedor se usó: `Email sent via brevo to ...` o `brevo failed: ...`.

### Control de Cuotas (Rate Limiting)

Para evitar bloqueos por parte de los proveedores por superar el _free tier_, el sistema lleva un conteo estricto de los correos enviados por día y por proveedor.
Esto se gestiona a través del modelo Prisma `MailProviderDailyCount` (tabla `mail_provider_daily_counts`):

- **Tracking exacto**: Cada intento incrementa el contador (`sentCount`) para la fecha actual (`usageDate`) y el proveedor correspondiente (`providerName`). Si el envío finalmente falla por un error del proveedor, el cupo reservado es liberado.
- **Bloqueo a nivel de BD**: Si el límite diario se alcanza, la consulta SQL transaccional bloquea el incremento impidiendo que el límite sea excedido, activando así el _fallback_ inmediato al siguiente proveedor.
- **Reseteo automático**: Al cambiar de día cronológico, la base de datos comienza a registrar sobre la nueva fecha (`CURRENT_DATE`), reseteando el contador de cuota a 0 de forma natural sin necesidad de tareas CRON.

---

## Cola de trabajos (pg-boss)

No se usa Redis. La cola vive en PostgreSQL (schema `jobs`).

| Parámetro | Valor |
|-----------|-------|
| Nombre del job | `send-mail` |
| Reintentos | 3 |
| Delay inicial | 5 segundos |
| Backoff | Exponencial |

### Envíos masivos

Para ~5.000 planillas/mes:

- Se procesan en **batches de 25** (`PLANILLA_BATCH_SIZE`).
- Cada batch encola hasta 25 jobs en pg-boss.
- Distribución recomendada: ~6–7 batches/día ≈ 150–175 emails/día (dentro del free tier).

---

## Configuración

Copiar variables al `.env` (ver también `.env.example` en la raíz del proyecto):

```bash
# ─── Estrategia ─────────────────────────────────
MAIL_PROVIDER_STRATEGY=primary-fallback

# ─── Primario: Brevo ────────────────────────────
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=<brevo-user>
BREVO_SMTP_PASS=<brevo-password>

# ─── Fallback: Gmail / Hostinger ────────────────
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<email-user>
EMAIL_PASSWORD=<email-password>

# ─── Remitente común ────────────────────────────
EMAIL_FROM=no-reply@jasrapo.com
EMAIL_FROM_NAME="JASRAP-Olon"
```

### Configurar Brevo

1. Crear cuenta gratuita en [brevo.com](https://www.brevo.com).
2. Ir a **SMTP & API** → generar clave SMTP.
3. Verificar dominio del remitente (`EMAIL_FROM`) vía DNS.

### Configurar Gmail

1. Activar verificación en 2 pasos en la cuenta Google.
2. Generar una **App Password** (no usar la contraseña normal).
3. Usar esa contraseña en `EMAIL_PASSWORD`.

---


### Enviar una planilla

```http
POST /api/v1/pre-invoices/42/send-email
Authorization: Bearer <token>
```

**Respuesta exitosa:**

```json
{
  "email": "cliente@ejemplo.com",
  "queued": true
}
```

El correo no se envía de forma síncrona: se encola y el worker lo procesa en segundo plano.

### Enviar varias planillas

```http
POST /api/v1/pre-invoices/send-email-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "prefacturaIds": [1, 2, 3, 4, 5]
}
```

**Respuesta:**

```json
{
  "queued": 4,
  "skipped": 1,
  "batches": 1
}
```

- `queued`: correos encolados correctamente.
- `skipped`: prefacturas sin email o con error al generar PDF.
- `batches`: cantidad de grupos de 25 procesados.

### Obtener el `prefacturaId`

```http
GET /api/v1/pre-invoices
```

Usar el campo `prefacturaId` de cada registro en la respuesta.

### Verificar el PDF antes de enviar

```http
GET /api/v1/pre-invoices/42/pdf
```

Devuelve el mismo PDF que se adjuntará al correo.

---

## Uso programático

### Desde otro módulo NestJS

`MailModule` es **global**. Inyectar `MailService` directamente:

```typescript
import { MailService } from 'src/infrastructure/mail/mail.service';

@Injectable()
export class MiServicio {
  constructor(private readonly mailService: MailService) {}

  async enviarPlanilla() {
    // Encolar con PDF ya generado
    await this.mailService.sendPlanilla(
      'cliente@mail.com',
      'Juan Pérez',
      'Junio 2026',
      25.50,
      pdfBuffer,
    );
  }
}
```

### Pipeline completo (recomendado)

Usar el caso de uso del módulo billing:

```typescript
import { SendPreInvoiceByEmailUseCase } from 'src/billing/pre-invoice/application/use-cases/send-pre-invoice-by-email.use-case';

await this.sendPreInvoiceByEmail.execute(prefacturaId);
```

Esto carga la prefactura, genera el PDF y encola el correo en un solo paso.

### Envío síncrono (sin cola)

Para correos urgentes y puntuales:

```typescript
const result = await this.mailService.send({
  to: 'admin@jasrapo.com',
  subject: 'Alerta',
  text: 'Mensaje de prueba',
});

if (!result.success) {
  console.error(result.error);
}
```

---

## Plantillas Handlebars

Ubicación: `src/infrastructure/mail/templates/`

| Archivo | Uso |
|---------|-----|
| `planilla.hbs` | Correo de planilla mensual (activa) |
| `base.hbs` | Layout base (referencia para futuras plantillas) |

### Variables disponibles en `planilla.hbs`

| Variable | Descripción |
|----------|-------------|
| `{{nombre}}` | Nombre del cliente |
| `{{periodo}}` | Nombre del período de facturación |
| `{{montoTotal}}` | Total a pagar (formato `25.50`) |
| `{{fechaEmision}}` | Fecha de emisión del correo |

### Agregar más datos de la BD

1. Ampliar el `context` en `SendPreInvoiceByEmailUseCase` o en `MailService.buildPlanillaMailOptions()`.
2. Usar las nuevas variables en `planilla.hbs`.

Ejemplo de campos candidatos desde la prefactura:

- `clienteIdentificacion`
- `contrato.numeroGuia`
- `consumoM3`
- `deudaAnterior`
- `periodoRel.fechaVencimiento`
- `lote.comunidad.nombre`

> Las plantillas `.hbs` se copian a `dist/` en el build. Están declaradas en `nest-cli.json` bajo `assets`.

---

## Estructura de archivos

```text
infrastructure/mail/
├── interfaces/
│   ├── mail-provider.interface.ts   # IMailProvider, SendMailOptions
│   └── mail-provider.config.ts        # Config Brevo + Gmail
├── providers/
│   ├── provider.factory.ts            # Fallback + rate limit
│   └── provider.factory.spec.ts
├── templates/
│   ├── base.hbs
│   └── planilla.hbs
├── nodemailer.provider.ts             # Wrapper legacy (MailerModule)
├── mail.service.ts                    # Orquestador principal
├── mail.service.spec.ts
├── mail-queue.service.ts              # Worker pg-boss
├── mail.module.ts
└── README.md                          # Este archivo

billing/pre-invoice/application/use-cases/
├── send-pre-invoice-by-email.use-case.ts
└── send-batch-pre-invoices-by-email.use-case.ts
```

---

## Pruebas

### Tests unitarios

```bash
cd backend
pnpm test -- --testPathPatterns="mail|send-pre-invoice-by-email"
```

### Prueba manual end-to-end

1. Configurar SMTP en `.env` (Brevo y/o Gmail).
2. Levantar el backend: `pnpm run start:dev`.
3. Verificar que el worker arrancó: buscar en logs `Worker de correo escuchando en PostgreSQL`.
4. Obtener un `prefacturaId` con email de cliente: `GET /api/v1/pre-invoices`.
5. Enviar: `POST /api/v1/pre-invoices/{prefacturaId}/send-email`.
6. Revisar logs del worker y la bandeja del cliente.

### Verificar fallback Brevo → Gmail

1. Configurar Brevo con credenciales inválidas y Gmail con credenciales válidas.
2. Enviar una planilla de prueba.
3. En logs debe aparecer `brevo failed: ...` seguido de `Email sent via gmail to ...`.



## Referencias

- Documentación de tareas: `docs/task/mail-sending-tasks.md`
- Swagger UI: `http://localhost:3000/api/docs` → tag `pre-invoices`
- PDF de prefactura: `backend/src/infrastructure/pdf/templates/pre-invoice.hbs`
