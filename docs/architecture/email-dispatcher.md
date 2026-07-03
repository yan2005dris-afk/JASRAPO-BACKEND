# Email Dispatcher — Arquitectura y Flujo

## Visión General

El sistema de envío de correos usa **pg-boss** (PostgreSQL) como cola transaccional, con dos estrategias de despacho configurables (failover / round-robin) y almacenamiento de adjuntos en **S3** (MinIO) con **fallback inline** para evitar saturar la base de datos.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Use Cases                                     │
│  send-pre-invoice-by-email.use-case.ts                                 │
│  send-batch-pre-invoices-by-email.use-case.ts                          │
└──────────────────────┬─────────────────────────────────────────────────┘
                       │ pdfBuffer (Buffer)
                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         MailService                                    │
│                                                                        │
│  sendPlanilla(to, nombre, periodo, monto, pdfBuffer)                   │
│    │                                                                   │
│    ├─► StorageService.upload() ──► S3 URL                             │
│    │    └─► falla ──► buffer inline                                   │
│    │                                                                   │
│    └─► SendMailOptions { version: 2, attachments: [url | content] }   │
└──────────────────────┬─────────────────────────────────────────────────┘
                       │ payload liviano (URL) o inline (fallback)
                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      MailQueueService                                  │
│                                                                        │
│  queueMail(options) ──► JobsService ──► pg-boss (jobs.job)            │
│                                                                        │
│  Worker (processMailJob):                                              │
│    ├─► version:1 | undefined ──► reconstruye Buffer desde JSON        │
│    └─► version:2 ──►                                                │
│         ├─► attachment.url ──► StorageService.getObject()             │
│         └─► attachment.content ──► usar directo                       │
└──────────────────────┬─────────────────────────────────────────────────┘
                       │ nodemailer.SendMailOptions (resuelto)
                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      MailProviderFactory                               │
│                                                                        │
│  send(options):                                                        │
│    ├─► buildMailOptions() ──► render template + resolve attachments   │
│    └─► MailDispatcher.send(mailOptions, providers)                    │
│                                                                        │
│  MailDispatcher (strategy):                                           │
│    ├─► FailoverDispatcher ──► intenta por prioridad                   │
│    └─► RoundRobinDispatcher ──► distribuye equitativamente            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes

### 1. Interfaces (`interfaces/mail-provider.interface.ts`)

```typescript
interface SendMailOptions {
  version?: 1 | 2;        // 1 = legacy (buffer serializado), 2 = URL/inline
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  attachments?: MailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

interface MailAttachment {
  filename: string;
  content?: Buffer | string;  // legacy / fallback inline
  url?: string;               // S3 URL (version:2)
  contentType?: string;
}

interface MailDispatcher {
  send(mailOptions: nodemailer.SendMailOptions,
       providers: MailProviderConfig[]): Promise<MailResult>;
}
```

### 2. MailService

**Rol**: Fachada principal. Orquesta el flujo desde los casos de uso hasta la cola.

**Método clave — `sendPlanilla()`**:

```typescript
async sendPlanilla(to, clienteNombre, periodo, montoTotal, pdfBuffer) {
  const attachments = await this.buildPlanillaAttachment(nombre, periodo, buffer);
  await this.sendQueued({ version: 2, to, subject, template, context, attachments });
}
```

**`buildPlanillaAttachment()`**:
1. Intenta `StorageService.upload(bucket, key, pdfBuffer)` → obtiene URL firmada
2. Si S3 falla → captura el error, usa `content: pdfBuffer` inline
3. Siempre retorna `{ filename, url? | content?, contentType }`

**Inyección**: `StorageService` es `@Optional()` — si no está disponible (tests), cae a inline sin error.

### 3. MailQueueService

**Rol**: Encola y procesa correos via pg-boss.

**Worker — `processMailJob()`**:
```typescript
const resolvedData = await this.resolveAttachments(data);
await this.mailProviderFactory.send(resolvedData);
```

**`resolveAttachments()`** — versión-aware:

| `version` | Payload | Acción |
|-----------|---------|--------|
| `undefined` o `1` | `content: { type: 'Buffer', data: [...] }` | Reconstruye Buffer desde JSON (legacy) |
| `2` | `url: 's3://bucket/key'` | `StorageService.getObject()` → stream → Buffer |
| `2` | `url: 'http://...'` (presigned) | `fetch()` directo sobre la URL HTTP |
| `2` | `content: Buffer` (fallback inline) | Usa directo |

**Configuración de reintentos** (`queueMail()`):
```typescript
{ retryLimit: 3, retryDelay: 5, retryDelayMax: 300, retryBackoff: true }
```

### 4. MailProviderFactory

**Rol**: Prepara el mail (renderiza template Handlebars, resuelve attachments) y delega el envío al `MailDispatcher`.

```typescript
async send(options) {
  const mailOptions = await this.buildMailOptions(options);
  if (this.dispatcher) {
    return this.dispatcher.send(mailOptions, enabledProviders);
  }
  return this.sendWithInlineLoop(mailOptions, ...); // fallback tests
}
```

**`buildMailOptions()`** (defense-in-depth):
- Si `attachment.url` presente y `!attachment.content` → descarga de S3
- Si `attachment.content` presente (como `{type:'Buffer', data:[...]}`) → reconstruye Buffer
- Renderiza template Handlebars con caché en memoria

### 5. Dispatchers

#### FailoverDispatcher

**Estrategia**: Ordena proveedores por `priority` ascendente, intenta uno por uno.

```typescript
for (const provider of sorted) {
  if (await rateLimitService.tryAcquire(provider.name, maxPerDay)) {
    try {
      transporter.sendMail(mailOptions);  // ✅ éxito → return
    } catch {
      rateLimitService.release(provider.name);
      // → next provider
    }
  }
}
return { success: false, error: 'All mail providers failed' };
```

**Pool**: Crea y cachea transporters Nodemailer por proveedor (`Map<name, Transporter>`).

#### RoundRobinDispatcher

**Estrategia**: Índice atómico, distribuye envíos equitativamente.

```typescript
const startIndex = this.index;
for (let attempt = 0; attempt < enabled.length; attempt++) {
  const idx = (startIndex + attempt) % enabled.length;
  // skip si está en cooldown (60s) o rate limit excedido
  try {
    transporter.sendMail(mailOptions);
    this.index = (idx + 1) % enabled.length; // avanza índice
    return { success: true };
  } catch {
    providerStates.set(provider.name, { inactiveUntil: now + 60_000 });
    this.index = (idx + 1) % enabled.length;
  }
}
```

**Cooldown**: 60 segundos. El provider se marca inactivo y se saltea hasta que pase el tiempo.

### 6. MailModule

**Wiring**: El módulo decide qué `MailDispatcher` inyectar según la estrategia configurada:

```typescript
providers: [
  FailoverDispatcher,
  RoundRobinDispatcher,
  {
    provide: 'MAIL_DISPATCHER',
    useFactory: (config, failover, roundRobin) => {
      const strategy = buildMailProviders(config)[0]?.strategy ?? 'failover';
      return strategy === 'round-robin' ? roundRobin : failover;
    },
    inject: [ConfigService, FailoverDispatcher, RoundRobinDispatcher],
  },
  MailProviderFactory,
  MailService,
  MailQueueService,
]
```

---

## Flujo Completo (Planilla con S3)

```
Use Case
  │ PdfService.render() → Buffer
  ▼
MailService.sendPlanilla(to, nombre, periodo, monto, pdfBuffer)
  │
  ├── buildPlanillaAttachment()
  │   ├── StorageService.upload('sri-pdfs', 'planillas/.../file.pdf', buffer)
  │   │   └── Éxito → referencia: `s3://sri-pdfs/planillas/.../file.pdf`
  │   └── return [{ filename: 'planilla-2025-01.pdf', url: 's3://sri-pdfs/...', contentType: 'application/pdf' }]
  │
  └── sendQueued({ version: 2, attachments: [{ url, filename }], ... })
      └── JobsService.send('send-mail', data)
          └── pg-boss: jobs.job (payload < 1KB)
              │
              ▼ (worker)
          MailQueueService.processMailJob(job)
              │ version: 2
              │
              ├── resolveAttachments()
              │   └── StorageService.getObject('sri-pdfs', 'planillas/.../file.pdf')
              │       → Readable → Buffer
              │
              └── MailProviderFactory.send(resolvedOptions)
                  ├── buildMailOptions() → render Handlebars template
                  ├── FailoverDispatcher.send(mailOptions, providers)
                  │   ├── tryAcquire('brevo', 300) → ok
                  │   ├── transporter.sendMail(mailOptions) → ✅ sent via brevo
                  │   └── return { success: true, messageId: '...' }
```

---

## Manejo de Fallos

| Fallo | Dónde | Acción |
|-------|-------|--------|
| `StorageService.upload()` falla | `MailService.buildPlanillaAttachment()` | Catch → incluye `content: Buffer` inline. Mail se envía igual. |
| `StorageService.getObject()` falla al procesar | `MailQueueService.resolveAttachments()` | Lanza error → pg-boss reintenta (retryLimit: 3, backoff) |
| Transporter falla (conexión SMTP) | Dispatchers | Fallover: pasa al siguiente provider. RR: cooldown 60s + siguiente. |
| Rate limit diario excedido | Dispatchers | `tryAcquire()` false → saltea provider silenciosamente. |
| Todos los transporters fallan | Dispatchers | `{ success: false, error: 'All mail providers failed' }` → pg-boss reintenta. |
| Jobs legacy en cola | `MailQueueService.resolveAttachments()` | `version:1` → reconstruye Buffer desde `{type:'Buffer', data:[...]}`. |

---

## Versionado de Jobs

| Escenario | `version` | Attachments | Worker |
|-----------|-----------|-------------|--------|
| Jobs legacy (antes del cambio) | `undefined` o `1` | `content: { type: 'Buffer', data: [...] }` | Reconstruye Buffer |
| S3 disponible | `2` | `url: 's3://bucket/key'` | `StorageService.getObject()` |
| Presigned URL (ej. jobs migrados) | `2` | `url: 'http://...'` | `fetch()` HTTP directo |
| S3 falla (fallback) | `2` | `content: Buffer` | Usa directo |

Los jobs legacy sin campo `version` se tratan como `version: 1`.

---

## Configuración

### Proveedores SMTP (desde `.env`)

| Variable | Proveedor | Default |
|----------|-----------|---------|
| `BREVO_SMTP_HOST` | Brevo | `smtp-relay.brevo.com` |
| `BREVO_SMTP_PORT` | Brevo | `587` |
| `BREVO_SMTP_USER` | Brevo | — |
| `BREVO_SMTP_PASS` | Brevo | — |
| `EMAIL_SERVICE` | Gmail | `gmail` |
| `EMAIL_HOST` | Gmail | `smtp.gmail.com` |
| `EMAIL_PORT` | Gmail | `587` |
| `EMAIL_USER` | Gmail | — |
| `EMAIL_PASSWORD` | Gmail | — |

### Estrategia

Definida en `MailProviderConfig.strategy` (hardcodeada como `'failover'` por defecto). Para cambiar a round-robin, modificar `buildMailProviders()` en `mail-provider.config.ts`.

---

## Tests

| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `failover.dispatcher.spec.ts` | 6 | Prioridad, fallback, rate limit, all-fail, sin providers, concurrencia |
| `round-robin.dispatcher.spec.ts` | 6 | Distribución, orden RR, cooldown, all-fail, sin providers, concurrencia |
| `mail.service.spec.ts` | 6 | sendPlanilla con S3, batch planillas, etc. |
| `provider.factory.spec.ts` | 6 | buildMailOptions, send, dispatcher delegation |
| `mail-rate-limit.service.spec.ts` | 5 | Límites diarios, release, concurrencia |

**Comando**: `cd backend && pnpm test`
