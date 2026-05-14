# Observabilidad - JASRAPO-BACKEND

Documentación del sistema de observabilidad implementado: logs, métricas y trazas.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        JASRAPO-BACKEND                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Pino      │  │ Prometheus  │  │   OpenTelemetry          │ │
│  │  (Logs)     │  │ (Métricas)  │  │   (Trazas)               │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
└─────────┼───────────────┼─────────────────────┼───────────────┘
          │               │                     │
          ▼               ▼                     ▼
    ┌───────────┐   ┌───────────┐         ┌───────────┐
    │   Loki    │   │Prometheus│         │   Tempo   │
    │  (Logs)   │   │(Scraping)│         │ (Trazas)  │
    └───────────┘   └───────────┘         └───────────┘
          │               │                     │
          └───────────────┼─────────────────────┘
                          ▼
                  ┌───────────────┐
                  │   Grafana     │
                  │ (Dashboard)   │
                  └───────────────┘
```

---

## 📦 Dependencias Instaladas

```bash
# Logs
pnpm install pino pino-pretty pino-roll

# Métricas
pnpm install prom-client

# Trazas (OpenTelemetry)
pnpm install @opentelemetry/api @opentelemetry/sdk-node
pnpm install @opentelemetry/auto-instrumentations-node
pnpm install @opentelemetry/exporter-trace-otlp-http
pnpm install @opentelemetry/exporter-metrics-otlp-http
pnpm install @opentelemetry/instrumentation-express
pnpm install @opentelemetry/instrumentation-http
pnpm install @opentelemetry/instrumentation-pg
```

---

## 📁 Estructura de Archivos

```
src/infrastructure/observability/
├── logger/
│   ├── logger.config.ts      # Configuración de Pino
│   ├── logger.service.ts     # Servicio de logging
│   └── logger.module.ts      # Módulo exportable
├── metrics/
│   ├── metrics.service.ts    # Métricas (contadores, histogramas)
│   ├── metrics.controller.ts # Endpoint /metrics
│   └── metrics.module.ts     # Módulo exportable
├── tracing/
│   ├── sampling.config.ts    # Configuración de muestreo
│   ├── tracing.service.ts    # Setup de OpenTelemetry
│   └── tracing.module.ts     # Módulo exportable
├── interceptors/
│   └── logging.interceptor.ts # Interceptor de HTTP
└── observabilidad.module.ts   # Módulo raíz
```

---

## 🌐 URLs de Acceso

### Desarrollo local

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend API** | 3000 | http://localhost:3000 |
| **Grafana** | 3002 | http://localhost:3002 |
| **Prometheus** | 9091 | http://localhost:9091 |
| **Tempo (Trazas)** | 16687 | http://localhost:16687 |
| **Loki (Logs)** | 3101 | http://localhost:3101 |

### Servidor de producción

Reemplazar `[IP_SERVIDOR]` por la IP real del servidor (ej: 192.168.101.52 o tu dominio)

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend API** | 3000 | http://[IP_SERVIDOR]:3000 |
| **Grafana** | 3002 | http://[IP_SERVIDOR]:3002 |
| **Prometheus** | 9091 | http://[IP_SERVIDOR]:9091 |
| **Tempo (Trazas)** | 16687 | http://[IP_SERVIDOR]:16687 |
| **Loki (Logs)** | 3101 | http://[IP_SERVIDOR]:3101 |

**Credenciales Grafana:** admin / admin

---

## 🔧 Uso del Logger

### Inyección básica

```typescript
import { Logger, Injectable } from '@nestjs/common';
import { LoggerService } from './infrastructure/observability/logger/logger.service';

@Injectable()
export class MiServicio {
  constructor(private readonly logger: LoggerService) {}

  miMetodo() {
    // Logs con contexto automático
    this.logger.log('Mensaje informativo', MiServicio.name);
    this.logger.warn('Advertencia', MiServicio.name);
    this.logger.error('Error con trace', error.stack, MiServicio.name);
    this.logger.debug('Debug info', MiServicio.name);
  }
}
```

### Con metadata estructurada

```typescript
// Logs con datos estructurados
this.logger.log(
  'Usuario creado',
  MiServicio.name,
  { userId: 123, email: 'test@test.com', rol: 'admin' } // metadata
);
```

### Configuración de niveles

```typescript
// En .env
LOG_LEVEL=debug      // trace, debug, info, warn, error
NODE_ENV=production // activa JSON output
```

---

## 📊 Uso de Métricas

### Métricas HTTP automáticas

El sistema registra automáticamente:
- `http_requests_total` - Total de requests por método, path, status
- `http_request_duration_seconds` - Duración en segundos
- `http_requests_in_progress` - Requests activos

### Métricas personalizadas

```typescript
import { MetricsService } from './infrastructure/observability/metrics/metrics.service';

@Injectable()
export class AuthService {
  constructor(private readonly metrics: MetricsService) {}

  async login(credentials: LoginDto) {
    const start = Date.now();
    
    try {
      const result = await this.authenticate(credentials);
      
      // Registrar éxito
      this.metrics.recordHttpRequest('POST', '/auth/login', 200);
      this.metrics.recordAuthLogin(true);
      
      return result;
    } catch (error) {
      // Registrar error
      this.metrics.recordHttpRequest('POST', '/auth/login', 401);
      this.metrics.recordAuthLoginFailed();
      throw error;
    } finally {
      // Registrar duración
      const duration = Date.now() - start;
      this.metrics.recordHttpDuration(duration);
    }
  }

  async queryDatabase(query: string) {
    const start = Date.now();
    const result = await this.db.query(query);
    const duration = Date.now() - start;
    
    this.metrics.recordDatabaseQuery(duration);
    return result;
  }
}
```

### Ver métricas

```bash
# Desarrollo local (el backend usa prefijo /api/v1)
GET http://localhost:3000/api/v1/metrics

# Servidor
GET http://[IP_SERVIDOR]:3000/api/v1/metrics
```

---

## 🔍 Uso de Trazas (OpenTelemetry)

### Trazas automáticas

Cada request HTTP genera automáticamente:
- Span de entrada (incoming request)
- Span de respuesta
- Attributes: http.method, http.url, http.status_code, http.response.content_length

### Trazas manuales

```typescript
import { TracingService } from './infrastructure/observability/tracing/tracing.service';

@Injectable()
export class PaymentService {
  constructor(private readonly tracing: TracingService) {}

  async processPayment(orderId: string, amount: number) {
    // Crear span manual
    const span = this.tracing.startSpan('process-payment');
    
    try {
      span.setAttribute('order.id', orderId);
      span.setAttribute('payment.amount', amount);
      
      // ... lógica de pago
      
      span.setAttribute('payment.status', 'success');
      span.end();
    } catch (error) {
      span.setAttribute('payment.status', 'failed');
      span.recordException(error);
      span.end();
      throw error;
    }
  }
}
```

---

## 🐳 Docker Compose

### Servicios incluidos

| Servicio | Imagen | Puertos | Recursos |
|----------|--------|---------|----------|
| postgres | postgres:16-alpine | 5432 | 1 CPU, 1GB |
| minio | minio/minio | 9000, 9001 | 0.5 CPU, 512MB |
| backend | jasrapo-backend | 3000 | 1 CPU, 1GB |
| prometheus | prom/prometheus:v2.45.0 | 9091 | 0.5 CPU, 512MB |
| tempo | grafana/tempo:2.2.3 | 4319, 4320, 3201, 16687 | 0.5 CPU, 512MB |
| loki | grafana/loki:2.8.0 | 3101 | 0.25 CPU, 256MB |
| grafana | grafana/grafana:10.1.0 | 3002 | 0.5 CPU, 512MB |

### Iniciar servicios

```bash
cd /home/yan2005dris-afk/Documentos/GitHub/JASRAPO-BACKEND
podman-compose up -d
```

### Ver logs de un servicio

```bash
podman logs -f jasrapo-prometheus
podman logs -f jasrapo-tempo
podman logs -f jasrapo-loki
```

---

## 🌐 Documentación Swagger

Las métricas están disponibles en la documentación Swagger:

1. Ir a:
   - Local: http://localhost:3000/api/v1/docs
   - Servidor: http://[IP_SERVIDOR]:3000/api/v1/docs
2. Buscar la sección **"metrics"**
3. Ver endpoint `GET /metrics` con descripción y ejemplos

---

## ⚙️ Variables de Entorno

```env
# Logging
LOG_LEVEL=info
LOG_PRETTY=true
NODE_ENV=development

# OpenTelemetry (production)
OTEL_SERVICE_NAME=jasrapo-backend
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://tempo:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://tempo:4318/v1/metrics

# Sampling (10% de las requests en producción)
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

---

## ✅ Buenas Prácticas

### Logs efectivos

```typescript
// ✅ BIEN: Logs estructurados con contexto
this.logger.log(
  `Order ${orderId} created for ${customerEmail}`,
  OrderService.name,
  { orderId, customerId: userId, totalAmount, itemCount }
);

// ❌ MAL: Logs vagos
console.log('se creo una orden');
```

### Métricas correctas

```typescript
// ✅ BIEN: Métricas con labels útiles
this.metrics.recordHttpRequest(method, path, status);
// Resultado: http_requests_total{method="POST",path="/users",status="201"} 42

// ❌ MAL: Sin labels (no se puede filtrar)
counter.add(1);
```

### Trazas significativas

```typescript
// ✅ BIEN: Spans con atributos de negocio
span.setAttribute('user.id', userId);
span.setAttribute('transaction.value', amount);
span.setAttribute('operation.type', 'payment');

// ❌ MAL: Span sin contexto
const span = tracer.startSpan('doStuff');
```

---

## 🔧 Configurar Grafana

1. Ir a:
   - Local: http://localhost:3002
   - Servidor: http://[IP_SERVIDOR]:3002
2. Login: **admin** / **admin**
3. Ir a **Configuration** > **Data Sources**
4. Agregar datasources:
   - **Prometheus**: http://jasrapo-prometheus:9090
   - **Tempo**: http://jasrapo-tempo:3200
   - **Loki**: http://jasrapo-loki:3100

### Query de ejemplo en Prometheus

```promql
# Requests por segundo
rate(http_requests_total[5m])

# Latencia p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Requests en curso
http_requests_in_progress
```

### Buscar logs en Loki (desde Grafana)

1. **Explore** > seleccionar **Loki**
2. Query: `{app="jasrapo-backend"}`
3. Filtrar por level: `{app="jasrapo-backend"} | json | level="error"`

---

## 📈 Dashboard Recomendado

Crear dashboard en Grafana con:

1. **HTTP Requests** (Prometheus)
   - Requests por segundo
   - Latencia p50, p95, p99
   - Errors por segundo

2. **Application Logs** (Loki)
   - Logs de error últimos 5 minutos
   - Logs por nivel

3. **Traces** (Tempo)
   - Errores distribuidos
   - Latencia por endpoint

---

## 📝 Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-04-30 | Implementación inicial: Logger (Pino), Metrics (Prometheus), Tracing (OpenTelemetry) |
| 2026-05-01 | Actualización con docker-compose completo + puertos alternativos para producción |