# Módulo de Infraestructura de Correo

Este módulo proporciona un sistema robusto, escalable y tolerante a fallos para la distribución asíncrona de correos electrónicos. Está diseñado principalmente para el envío de planillas de consumo de agua potable, soportando la distribución masiva de un gran volumen de documentos (aprox. 5.000 mensuales) mediante el uso de colas en PostgreSQL y estrategias avanzadas de fallback SMTP.

---

## Arquitectura del Sistema

El módulo sigue una arquitectura modular en capas que separa la lógica de negocio, el encolamiento de trabajos y la comunicación con los proveedores SMTP.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Capa de Dominio / Casos de Uso               │
│                                                                 │
│  SendPreInvoiceByEmailUseCase                                   │
│  SendBatchPreInvoicesByEmailUseCase                             │
│       │                                                         │
│       ├─► Generación de Documento (PDF)                         │
│       └─► Invocación de MailService                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    Capa de Infraestructura (Mail)               │
│                                                                 │
│  MailService ──► MailQueueService ──► Motor de Colas (pg-boss)  │
│       │                    │                                    │
│       │                    └──► MailProviderFactory             │
│       │                              │                          │
│       └── Envío síncrono             ├── Brevo (Primario)       │
│                                      └── Gmail (Secundario)     │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Principales

| Componente | Descripción y Responsabilidad |
|------------|-------------------------------|
| `MailService` | Fachada principal y API de alto nivel. Expone los métodos de orquestación para envíos síncronos (`send()`) y asíncronos (`sendPlanilla()`, `sendBatchPlanillas()`). |
| `MailQueueService` | Integra el motor `pg-boss` para encolar y procesar los trabajos en segundo plano (`send-mail`), asegurando la retención y recuperación en caso de fallos del servidor. |
| `MailProviderFactory` | Administrador de los transportes SMTP. Implementa la lógica de selección de proveedores, *fallback* por agotamiento de cuota o fallo de red, *rate limiting* atómico y *connection pooling* para optimizar el rendimiento. |
| `MailMetricsController` | Expone el endpoint de observabilidad y métricas de rendimiento de la cola a través de consultas directas a PostgreSQL. |
| `templates/` | Almacén de las plantillas `.hbs` utilizadas para la compilación de los correos mediante Handlebars, asegurando las variables dinámicas contra inyección de código. |

---

## Estrategia de Conectividad SMTP y Fallback

Para garantizar una alta disponibilidad en las comunicaciones, el sistema opera con un patrón de Tolerancia a Fallos asistido por una cascada de prioridades.

1. **Proveedor Primario (Brevo)**: Configurado para absorber la carga transaccional principal con un límite diario estricto para evitar cobros no deseados o penalizaciones en la capa de servicios gratuitos.
2. **Proveedor Secundario (Gmail/Hostinger)**: Actúa exclusivamente como un sistema de contingencia automática (*fallback*).

### Control Atómico de Cuotas (Rate Limiting)

Para evitar bloqueos por parte de los proveedores por superar los límites de envío, se ejecuta un conteo de control de cuotas administrado de manera concurrente en la base de datos (tabla `mail_provider_daily_counts`).

- **Bloqueo Transaccional**: Antes de instanciar la conexión SMTP, `MailRateLimitService` utiliza una instrucción SQL atómica (`INSERT ... ON CONFLICT`) para verificar y reservar el espacio en la cuota. Si se rebasa el tope, bloquea la petición e instruye a la fábrica a rotar inmediatamente al siguiente proveedor en la lista de prioridad.
- **Liberación en Fallos**: Si un proveedor reporta un error genuino de red durante la negociación SMTP, el servicio libera el cupo reservado de la cuota diaria para no agotar falsamente el conteo.
- **Eficiencia de Conexiones**: Los transportes SMTP están configurados con un **Connection Pool (max 5 conexiones concurrentes)**. Esto previene la saturación de los puertos de red y evita la carga criptográfica excesiva (TLS handshake) reiterada en los envíos agrupados.

---

## Motor de Colas Asíncrono

La gestión de trabajos en segundo plano descansa íntegramente sobre **pg-boss**, eliminando la dependencia de servicios externos de caché en memoria como Redis y consolidando la infraestructura en la base de datos transaccional PostgreSQL (schema `jobs`).

### Parámetros de Operación

| Parámetro Operativo | Configuración | Descripción |
|---------------------|---------------|-------------|
| **Identificador** | `send-mail` | Nombre registrado en la tabla `jobs.job`. |
| **Política de Reintentos**| 3 intentos | Limita el consumo de CPU ante caídas permanentes de servicios externos. |
| **Delay Inicial** | 5 segundos | Tiempo de enfriamiento base tras un fallo. |
| **Delay Máximo** | 300 segundos | Límite superior del decaimiento algorítmico, previniendo retrasos indefinidos. |
| **Backoff** | Exponencial | Atenuación progresiva en los intervalos de reintento. |

### Procesamiento Masivo

Al ejecutar una operación de envíos masivos (`SendBatchPreInvoicesByEmailUseCase`), los destinatarios se segmentan en bloques lógicos (típicamente de 25 unidades). Estos bloques se encolan a través de `queueBulkMails`, mitigando la saturación de memoria RAM del servidor de la aplicación y distribuyendo armónicamente el esfuerzo de red.

---



## Seguridad y Compilación de Plantillas (Handlebars)

Las plantillas base de correo electrónico se alojan en `src/infrastructure/mail/templates/`. Durante la construcción del contexto que se inyecta en la vista, el motor de Handlebars exige seguir un protocolo de inyección de variables para prevenir vulnerabilidades de *Cross-Site Scripting (XSS)* y envenenamiento HTML.

* **Contextos de Usuario (`{{variable}}`)**: Todo campo que provenga de interacción directa o indirecta del usuario, o de la base de datos (nombres, observaciones), debe ser renderizado bajo dobles llaves. Esto fuerza el escape HTML sistemático de su contenido.
* **Contextos Estructurales (`{{{html}}}`)**: Exclusivo para incrustar componentes dinámicos HTML puros (como bloques codificados generados íntegramente en el backend) que son de absoluta y estricta confianza.

---

## Endpoints de Monitoreo Operativo

El módulo cuenta con un controlador de diagnóstico que permite obtener la salud del sistema, métricas generales de estado (Completados, Pendientes, Fallidos) y el historial inmediato de los 50 últimos procesos extraídos directamente desde el motor de colas.

**GET** `/api/v1/mail/metrics`
Proporciona la radiografía operativa en tiempo real en formato JSON con la lista detallada de los trabajos recientes (`recentJobs`).

---

## Uso Programático Interno

La integración transversal del sistema de correos está diseñada para ser declarativa y sin fricción mediante su exportación global.

```typescript
import { MailService } from 'src/infrastructure/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailService) {}

  async dispatchInvoice(clienteEmail: string, pdfBuffer: Buffer) {
    // El proceso se difiere y acopla a la cola asíncrona de manera transparente
    await this.mailService.sendPlanilla(
      clienteEmail,
      'Cliente Principal',
      'Mes de Ejercicio',
      new Decimal('15.50'),
      pdfBuffer,
    );
  }
}
```

Para despachos unitarios críticos que requieran constatación técnica instantánea, el sistema permite invocar el método `send()` nativamente, eludiendo el motor asíncrono y enlazándose directamente de forma síncrona con el *MailProviderFactory*.
