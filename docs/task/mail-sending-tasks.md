# Mail Sending — Task List (Planillas Mensuales)

## Contexto del Proyecto

- **Stack**: NestJS 11 + Prisma 7 + PostgreSQL
- **Módulo**: `backend/src/infrastructure/mail/`
- **Dependencias**: `@nestjs-modules/mailer`, `nodemailer`, `handlebars`, `pg-boss`
- **Patrón**: Clean Architecture con interfaz `IMailProvider` intercambiable
- **Cola**: pg-boss sobre PostgreSQL (sin Redis)

### Caso de Uso: Envío de Planillas Mensuales

```
5,000 clientes
├── Batches de 25 emails por envío
├── ~200 batches totales por mes
├── Distribuidos en ~30 días
└── ~6-7 batches/día = 150-175 emails/día
```

**Flujo actual**:
1. Se genera la planilla mensual (PDF) para cada cliente
2. Se encola el envío del email con la planilla adjunta
3. Se procesa en batches de 25 para no sobrecargar el provider

### Estado Actual (lo que YA existe)

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `interfaces/mail-provider.interface.ts` | ✅ Listo | `IMailProvider`, `SendMailOptions`, `MailResult`, `MailAttachment` |
| `nodemailer.provider.ts` | ✅ Listo | Implementación SMTP vía `@nestjs-modules/mailer` |
| `mail.module.ts` | ✅ Listo | Módulo global con config SMTP, Handlebars adapter |
| `mail-queue.service.ts` | ✅ Listo | Cola con pg-boss (retry 3, backoff) |
| `templates/` | ⚠️ Vacío | Directorio existe pero sin plantillas Handlebars |
| Fallback provider | ❌ Falta | Sin backup si Brevo se cae |
| Tracking de envíos | ❌ Falta | No se registra qué emails se enviaron |

### Estrategia de Providers

**Análisis de Free Tier** (5,000 emails/mes, ~175/día):

| Proveedor | Free Diario | Free Mensual | ¿Alcanza? |
|-----------|-------------|--------------|-----------|
| **Brevo (SMTP)** | 300/día | ~9,000/mes | ✅ Sobrado |
| **Gmail (Hostinger)** | 500/día | ~15,000/mes | ✅ Sobrado |

**Estrategia elegida**: Primary + Fallback simple

```
┌──────────────────────────────────────────┐
│            MailService                   │
│  ┌──────────┐     ┌──────────────────┐   │
│  │ Brevo    │ ──→ │ Gmail/Hostinger  │   │
│  │(Primary) │     │   (Fallback)     │   │
│  └──────────┘     └──────────────────┘   │
└──────────────────────────────────────────┘
```

- **Primario**: Brevo SMTP (300/día, API limpia, tracking incluido)
- **Fallback**: Gmail/Hostinger (500/día, ya configurado en .env)
- Si Brevo falla o alcanza límite → automáticamente usa Gmail

**Configuración .env**:

```bash
# ─── Mail Provider Strategy ─────────────────────
MAIL_PROVIDER_STRATEGY=primary-fallback

# ─── Primary: Brevo (Sendinblue) ────────────────
MAIL_PROVIDER_PRIMARY=brevo
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=1@smtp-brevo.com
BREVO_SMTP_PASS=tu-api-key-brevo
EMAIL_FROM=no-reply@jasrapo.com
EMAIL_FROM_NAME="JASRAP-Olon"

# ─── Fallback: Gmail/Hostinger ──────────────────
MAIL_PROVIDER_FALLBACK=gmail
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-usuario@jasrapo.com
EMAIL_PASSWORD=tu-app-password
```

---

## Archivos a Crear/Modificar

### Estructura de directorios

```
backend/src/infrastructure/mail/
├── interfaces/
│   ├── mail-provider.interface.ts          # ✅ Ya existe
│   └── mail-provider.config.ts             # ❌ NUEVO: Config providers
├── providers/
│   ├── nodemailer.provider.ts              # ✅ Ya existe
│   └── provider.factory.ts                 # ❌ NUEVO: Factory con fallback
├── templates/
│   ├── base.hbs                            # ❌ NUEVO: Layout base
│   └── planilla.hbs                        # ❌ NUEVO: Template planilla mensual
├── mail.module.ts                          # ✅ Ya existe (modificar)
├── mail.service.ts                         # ❌ NUEVO: Orquestador principal
├── mail-queue.service.ts                   # ✅ Ya existe (modificar)
└── mail.service.spec.ts                    # ❌ NUEVO: Tests
```

---

## Tareas Detalladas

### T0: Config Multi-Provider

**Archivos**:
- `interfaces/mail-provider.config.ts` (nuevo)

**Implementación**:

```typescript
export interface MailProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  rateLimit: { maxPerDay: number };
  options: Record<string, any>;
}

export const MAIL_PROVIDERS: MailProviderConfig[] = [
  {
    name: 'brevo',
    enabled: !!process.env.BREVO_SMTP_USER,
    priority: 1,
    rateLimit: { maxPerDay: 300 },
    options: {
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    },
  },
  {
    name: 'gmail',
    enabled: !!process.env.EMAIL_USER,
    priority: 2,
    rateLimit: { maxPerDay: 500 },
    options: {
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  },
];
```

**Criterio de aceptación**: Config tipada, carga automática de .env.

---

### T1: Provider Factory con Fallback

**Archivos**:
- `providers/provider.factory.ts` (nuevo)
- `providers/provider.factory.spec.ts` (nuevo)

**Implementación**:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { IMailProvider, SendMailOptions, MailResult } from '../interfaces/mail-provider.interface';
import { NodemailerProvider } from './nodemailer.provider';
import { MAIL_PROVIDERS, MailProviderConfig } from '../interfaces/mail-provider.config';

@Injectable()
export class MailProviderFactory {
  private readonly logger = new Logger(MailProviderFactory.name);
  private readonly dailyCounts = new Map<string, { count: number; date: string }>();

  constructor(private readonly nodemailerProvider: NodemailerProvider) {}

  async send(options: SendMailOptions): Promise<MailResult> {
    const providers = MAIL_PROVIDERS
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of providers) {
      if (!this.canSend(provider)) {
        this.logger.warn(`${provider.name} reached daily limit, trying next`);
        continue;
      }

      try {
        // Configurar transport según el provider
        const result = await this.nodemailerProvider.send(options);
        if (result.success) {
          this.incrementCount(provider.name);
          return result;
        }
        this.logger.warn(`${provider.name} failed: ${result.error}`);
      } catch (error: any) {
        this.logger.error(`${provider.name} error: ${error.message}`);
      }
    }

    return {
      messageId: '',
      success: false,
      error: 'All mail providers failed',
    };
  }

  private canSend(provider: MailProviderConfig): boolean {
    const today = new Date().toISOString().split('T')[0];
    const counter = this.dailyCounts.get(provider.name);

    if (!counter || counter.date !== today) {
      return true;
    }

    return counter.count < provider.rateLimit.maxPerDay;
  }

  private incrementCount(providerName: string): void {
    const today = new Date().toISOString().split('T')[0];
    const counter = this.dailyCounts.get(providerName);

    if (!counter || counter.date !== today) {
      this.dailyCounts.set(providerName, { count: 1, date: today });
    } else {
      counter.count++;
    }
  }
}
```

**Criterio de aceptación**:
- Fallback automático entre Brevo y Gmail
- Rate limiting por provider (no exceder free tier)
- Spec cubre: send OK, provider fallback, rate limit

---

### T2: MailService (Orquestador)

**Archivos**:
- `mail.service.ts` (nuevo)
- `mail.service.spec.ts` (nuevo)

**Implementación**:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MailProviderFactory } from './providers/provider.factory';
import { MailQueueService } from './mail-queue.service';
import { SendMailOptions, MailResult } from './interfaces/mail-provider.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly providerFactory: MailProviderFactory,
    private readonly queueService: MailQueueService,
  ) {}

  /**
   * Envío síncrono (pocos emails, urgente)
   */
  async send(options: SendMailOptions): Promise<MailResult> {
    return this.providerFactory.send(options);
  }

  /**
   * Envío en cola (planillas masivas)
   */
  async sendQueued(options: SendMailOptions): Promise<void> {
    await this.queueService.queueMail(options);
  }

  /**
   * Envío masivo de planillas
   */
  async sendBulkPlanillas(mails: SendMailOptions[]): Promise<void> {
    await this.queueService.queueBulkMails(mails);
  }

  /**
   * Enviar planilla a un cliente específico
   */
  async sendPlanilla(
    to: string,
    clienteNombre: string,
    periodo: string,
    montoTotal: number,
    pdfBuffer: Buffer,
  ): Promise<void> {
    await this.sendQueued({
      to,
      subject: `Planilla de Servicio de Agua - ${periodo}`,
      template: 'planilla',
      context: {
        nombre: clienteNombre,
        periodo,
        montoTotal: montoTotal.toFixed(2),
        fechaEmision: new Date().toLocaleDateString('es-EC'),
      },
      attachments: [
        {
          filename: `planilla-${periodo}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Enviar planillas en batch (25 por vez)
   */
  async sendBatchPlanillas(
    clientes: Array<{
      email: string;
      nombre: string;
      monto: number;
      pdf: Buffer;
    }>,
    periodo: string,
  ): Promise<void> {
    const mails: SendMailOptions[] = clientes.map((c) => ({
      to: c.email,
      subject: `Planilla de Servicio de Agua - ${periodo}`,
      template: 'planilla',
      context: {
        nombre: c.nombre,
        periodo,
        montoTotal: c.monto.toFixed(2),
        fechaEmision: new Date().toLocaleDateString('es-EC'),
      },
      attachments: [
        {
          filename: `planilla-${periodo}.pdf`,
          content: c.pdf,
          contentType: 'application/pdf',
        },
      ],
    }));

    await this.sendBulkPlanillas(mails);
  }
}
```

**Criterio de aceptación**:
- Métodos `sendPlanilla` y `sendBatchPlanillas` funcionan
- Tests cubren send, sendQueued, sendBulkPlanillas

---

### T3: Templates Handlebars

**Archivos**:
- `templates/base.hbs` (nuevo)
- `templates/planilla.hbs` (nuevo)

**base.hbs**:

```handlebars
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a5276; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666666; }
    .amount { font-size: 24px; font-weight: bold; color: #1a5276; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JASRAP-Olon</h1>
      <p>Servicio de Agua Potable</p>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>JASRAP-Olon — Servicio de Gestión de Agua</p>
      <p>Si tenés dudas, contactanos al administrative@jasrapo.com</p>
    </div>
  </div>
</body>
</html>
```

**planilla.hbs**:

```handlebars
<h2>Estimado/a {{nombre}},</h2>

<p>Le hacemos llegar la planilla correspondiente al período <strong>{{periodo}}</strong>.</p>

<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 5px 0;"><strong>Período:</strong> {{periodo}}</p>
  <p style="margin: 5px 0;"><strong>Fecha de emisión:</strong> {{fechaEmision}}</p>
  <p style="margin: 10px 0 5px 0;">Monto a pagar:</p>
  <p class="amount">${{montoTotal}}</p>
</div>

<p>Adjunto encontrará el comprobante en formato PDF con el detalle de su consumo.</p>

<p>Le recordamos que puede realizar su pago en los puntos autorizados.</p>

<p>Saludos cordiales,<br><strong>JASRAP-Olon</strong></p>
```

**Criterio de aceptación**:
- Template renderiza correctamente con variables
- Responsive (se lee bien en celular)
- PDF se adjunta correctamente

---

### T4: Actualizar MailModule

**Archivos**:
- `mail.module.ts` (modificar)

**Cambios**:

```diff
import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { NodemailerProvider } from './nodemailer.provider';
+ import { MailProviderFactory } from './providers/provider.factory';
+ import { MailService } from './mail.service';
import { MailQueueService } from './mail-queue.service';
import { JobsModule } from '../jobs/jobs.module';

@Global()
@Module({
  imports: [
    JobsModule,
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
-         service: config.get('EMAIL_SERVICE'),
-         host: config.get('EMAIL_HOST', 'localhost'),
-         port: config.get('EMAIL_PORT', 587),
-         secure: config.get('EMAIL_SECURE', 'false') === 'true',
+         host: config.get('BREVO_SMTP_HOST', 'smtp-relay.brevo.com'),
+         port: parseInt(config.get('BREVO_SMTP_PORT', '587')),
+         secure: false,
          auth: {
-           user: config.get('EMAIL_USER'),
-           pass: config.get('EMAIL_PASSWORD'),
+           user: config.get('BREVO_SMTP_USER'),
+           pass: config.get('BREVO_SMTP_PASS'),
          },
        },
        defaults: {
          from: `"${config.get('EMAIL_FROM_NAME', 'JASRAP-Olon')}" <${config.get('EMAIL_FROM', 'no-reply@jasrapo.com')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    NodemailerProvider,
+   MailProviderFactory,
+   MailService,
    MailQueueService,
  ],
- exports: [NodemailerProvider, MailQueueService],
+ exports: [MailService, MailQueueService],
})
export class MailModule {}
```

**Criterio de aceptación**:
- MailService es el export principal
- MailModule sigue siendo global
- Config apunta a Brevo por defecto

---

### T5: Actualizar mail-queue.service.ts

**Archivos**:
- `mail-queue.service.ts` (modificar)

**Cambios**: Usar `MailService` en vez de `NodemailerProvider` directo.

```diff
+ import { MailService } from './mail.service';

@Injectable()
export class MailQueueService implements OnModuleInit {
  constructor(
    private readonly jobsService: JobsService,
-   private readonly mailProvider: NodemailerProvider,
+   private readonly mailService: MailService,
  ) {}

  private async processMailJob(job: any): Promise<void> {
    const data: SendMailOptions = job.data;
-   const result = await this.mailProvider.send(data);
+   const result = await this.mailService.send(data);
    // ... resto igual
  }
}
```

**Criterio de aceptación**: Queue usa MailService (con fallback), no Nodemailer directo.

---

### T6: Tests Unitarios

**Archivos**:
- `providers/provider.factory.spec.ts` (nuevo)
- `mail.service.spec.ts` (nuevo)

**Escenarios de test**:

| Archivo | Escenarios |
|---------|-----------|
| provider.factory.spec.ts | send OK, fallback a gmail, rate limit, all providers fail |
| mail.service.spec.ts | send sync, send queued, sendBatchPlanillas, sendPlanilla |

**Criterio de aceptación**: Coverage > 80% para el módulo mail.

---

### T7: Documentación y .env.example

**Archivos**:
- `.env.example` (modificar)
- `infrastructure/mail/README.md` (nuevo)

**Agregar a .env.example**:

```bash
# ─── Mail Provider Strategy ─────────────────────
MAIL_PROVIDER_STRATEGY=primary-fallback

# ─── Primary: Brevo (Sendinblue) ────────────────
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=1@smtp-brevo.com
BREVO_SMTP_PASS=tu-api-key-brevo

# ─── Fallback: Gmail/Hostinger ──────────────────
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-usuario@jasrapo.com
EMAIL_PASSWORD=tu-app-password

# ─── Común ─────────────────────────────────────
EMAIL_FROM=no-reply@jasrapo.com
EMAIL_FROM_NAME="JASRAP-Olon"
```

**Criterio de aceptación**:
- .env.example documenta todas las variables
- README explica cómo configurar Brevo y Gmail

---

## Resumen de Archivos

| # | Archivo | Acción | Descripción |
|---|---------|--------|-------------|
| 0 | `interfaces/mail-provider.config.ts` | CREAR | Config de providers (Brevo + Gmail) |
| 1 | `providers/provider.factory.ts` | CREAR | Factory con fallback automático |
| 1 | `providers/provider.factory.spec.ts` | CREAR | Tests del factory |
| 2 | `mail.service.ts` | CREAR | Orquestador con métodos de planillas |
| 2 | `mail.service.spec.ts` | CREAR | Tests del service |
| 3 | `templates/base.hbs` | CREAR | Layout base Handlebars |
| 3 | `templates/planilla.hbs` | CREAR | Template planilla mensual |
| 4 | `mail.module.ts` | MODIFICAR | Registrar MailService, export principal |
| 5 | `mail-queue.service.ts` | MODIFICAR | Usar MailService en vez de Nodemailer |
| 6 | Tests unitarios | CREAR | 2 archivos de specs |
| 7 | `.env.example` | MODIFICAR | Variables multi-provider |
| 7 | `README.md` | CREAR | Documentación del módulo |

**Total**: 7 archivos crear + 3 modificar

---

## Dependencias Nuevas

**Ninguna**. Todo funciona con las dependencias ya instaladas (`@nestjs-modules/mailer`, `nodemailer`, `handlebars`).

---

## Notas para Ejecución

- **Prioridad sugerida**: T0 → T1 → T2 → T3 → T4 → T5 → T6 → T7
- **Dependency chain**: T0 es prerequisito. T1 requiere T0. T2 requiere T1. T3 puede paralelizar. T4+T5 requieren T2.
- **Labels sugeridas**: `backend`, `infrastructure`, `mail`, `planillas`, `brevo`
- **Sprint sugerido**: 1 sprint
- **Breaking changes**: Ninguno — la interfaz IMailProvider no cambia
- **Rollback**: Si Brevo falla, el .env se cambia a Gmail directamente
- **Configuración Brevo**: Requiere cuenta gratis + verificar dominio con DNS
- **Configuración Gmail**: Requiere App Password (no contraseña normal)
