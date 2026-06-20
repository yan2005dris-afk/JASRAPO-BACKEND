# Motor de Trabajos en Segundo Plano (pg-boss)

Este módulo implementa el motor de ejecución de tareas en segundo plano del backend mediante **pg-boss**, eliminando la necesidad de dependencias en memoria externas como Redis y consolidando toda la lógica asíncrona dentro de la base de datos relacional PostgreSQL (esquema `jobs`).

---

## Estructura y Funcionamiento

### 1. Base de Datos
pg-boss almacena y gestiona las colas utilizando tablas relacionales nativas en PostgreSQL dentro del esquema **`jobs`**. Las tablas principales creadas automáticamente son:

*   **`jobs.job`**: Tabla activa donde se almacenan los trabajos pendientes, activos, completados y fallados.
*   **`jobs.archive`**: Histórico donde pg-boss mueve de forma asíncrona los trabajos completados o fallados para optimizar el rendimiento de la tabla activa.
*   **`jobs.schedule`**: Configuración de trabajos recurrentes (cron).
*   **`jobs.queue`**: Tabla interna con estadísticas y configuraciones de las colas.

---

## Resumen del Trabajo en esta Rama (`feat-mail-sending-planillas-mensuales`)

En esta rama se consolidó la infraestructura de encolamiento y se migraron/crearon tres flujos críticos a procesamiento asíncrono sobre pg-boss:

### 1. Envío Masivo de Planillas Mensuales (`send-mail`)
*   Se desarrolló `MailQueueService` para procesar envíos de correo en lotes de hasta 25 unidades.
*   Integración con `MailProviderFactory` para implementar **Rate Limiting** atómico contra base de datos y **contingencia automática (fallback)** entre Brevo y Gmail si el principal falla o agota su cuota.

### 2. Emisión Electrónica de Comprobantes (`sri-emision`)
*   Se migró el procesamiento síncrono del SRI a asíncrono para evitar bloqueos del servidor y desconexiones por latencia en el webservice del SRI.

### 3. Envío de Webhooks a Clientes Integrados (`webhook-dispatch`)
*   Cola para el despacho asíncrono de eventos HTTP (firmados criptográficamente) a URLs de terceros con reintentos progresivos ante fallos de red.

---

## Integración en Código (Cómo registrar colas y workers)

### 1. Encolar un Trabajo
Para enviar un payload JSON a una cola, usá el método `send` del servicio `JobsService`:

```typescript
import { JobsService } from 'src/infrastructure/jobs/jobs.service';

constructor(private readonly jobsService: JobsService) {}

async dispatchTask(data: MyPayload) {
  await this.jobsService.send('mi-cola-de-trabajo', data, {
    retryLimit: 3,
    retryDelay: 10,
    retryBackoff: true
  });
}
```

### 2. Registrar un Worker (Procesar)
> [!IMPORTANT]
> **Firma de Callback (Array de Trabajos):**
> En pg-boss, el callback que se le pasa al método `work` **siempre recibe un array de trabajos** (`Job[]`), incluso si el tamaño del lote (`batchSize`) es 1. Es obligatorio destructurar el primer elemento `[job]` para evitar acceder a un array indefinido.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';

@Injectable()
export class MyProcessor implements OnModuleInit {
  constructor(private readonly jobsService: JobsService) {}

  async onModuleInit() {
    // Destructurar [job] del array recibido
    await this.jobsService.work('mi-cola-de-trabajo', async ([job]) => {
      if (job) {
        await this.executeLogic(job.data);
      }
    });
  }

  private async executeLogic(data: any) {
    // Lógica de procesamiento
  }
}
```

---

## Panel de Control y Diagnóstico (Dashboard)

El proyecto cuenta con un panel de control interactivo para monitorear el estado de las colas, forzar reintentos de trabajos fallados o depurar payloads.

### Levantar el Dashboard Localmente:
Desde la carpeta `backend/` de tu espacio de trabajo:

```bash
pnpm pgboss:dashboard
```
El panel estará disponible en [http://localhost:3002](http://localhost:3002).

---

## Consultas directas de Diagnóstico (SQL)
Si necesitás verificar los estados de las colas sin el dashboard, podés usar cualquier gestor de base de datos con estas consultas:

```sql
-- Resumen de trabajos agrupados por cola y estado actual
SELECT name AS cola, state AS estado, count(*) AS total 
FROM jobs.job 
GROUP BY name, state 
ORDER BY name, state;

-- Listar los últimos 50 trabajos fallidos con sus respectivos errores
SELECT id, name, state, data, output, created_on, retry_count
FROM jobs.job 
WHERE state = 'failed' 
ORDER BY created_on DESC 
LIMIT 50;
```
