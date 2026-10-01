# 🖥️ Guía de Observabilidad - JASRAPO

## ¿Qué es la Observabilidad?

La observabilidad permite **monitorear, diagnosticar y debuggear** el sistema en producción. Está compuesto por tres pilares:

| Pilar | Herramienta | Descripción |
|-------|------------|-------------|
| **Métricas** | Prometheus | Datos numéricos (CPU, memoria, requests) |
| **Logs** | Loki | Registros estructurados del sistema |
| **Trazas** | Tempo | Rastreo de requests distribuidos |

## 🏗️ Arquitectura de Observabilidad

```
┌─────────────────────────────────────────────────────────────────┐
│                         JASRAPO BACKEND                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Métricas   │  │    Logs     │  │     Trazas       │   │
│  │ Prometheus  │  │    Loki    │  │     Tempo       │   │
│  └──────┬──────┘  └──────┬─────┘  └────────┬─────────┘   │
│         │                │               │                   │
└────────┼────────────────┼───────────────┼───────────────────┘
         │                │               │
         ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GRAFANA DASHBOARD                        │
│  http://localhost:3002 (local) / http://TU-DOMINIO (prod)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes

### 1. Prometheus

**Qué hace**: Recolecta y almacena métricas como series temporales.

**Puertos**:
- Local: `9091`
- Producción: `9090` (expuesto)

**Métricas disponibles**:
- `http_request_duration_seconds` - Latencia de requests
- `http_requests_total` - Total de requests por estado
- `active_connections` - Conexiones activas
- `error_total` - Errores por código

### 2. Loki

**Qué hace**: Sistema de logs horizontally scalable.

**Puertos**:
- Local: `3101`
- Producción: `3100`

**Formato de logs esperado**: JSON con context (correlation ID, usuario, nivel)

### 3. Tempo

**Qué hace**: Almacén de trazas distribuidas compatible con Jaeger.

**Puertos**:
- Local: `4319` (OTLP HTTP), `4320` (OTLP gRPC), `3201` (API), `16687` (Jaeger UI)
- Producción: mismo

### 4. Grafana

**Qué hace**: Visualización de métricas, logs y trazas.

**Puertos**:
- Local: `3002`
- Producción: `3000`

**Credenciales por defecto**:
- Usuario: `admin`
- Contraseña: `admin`

---

## 🚀 Instalación y Configuración

### Desenvolvimento Local (Docker)

#### 1. Requisitos

- Docker + Docker Compose
- Puertos disponibles: `3002`, `3101`, `4319`, `4320`, `9091`, `16687`

#### 2. Levantar la stack

```bash
# Ir a la raíz del proyecto
cd JASRAPO-BACKEND

# Levantar solo el stack core (Postgres, RustFS, Backend sin observabilidad)
podman compose up -d
# O con Docker:
docker compose up -d

# Levantar con el stack completo de observabilidad (Prometheus, Tempo, Loki, Grafana)
podman compose --profile observability up -d
# O con Docker:
docker compose --profile observability up -d
```

#### 3. Verificar servicios

| Servicio | URL | Descripción |
|---------|-----|----------|
| **Prometheus** | http://localhost:9091 | Métricas |
| **Grafana** | http://localhost:3002 | Dashboards |
| **Loki** | http://localhost:3101 | Logs (API) |
| **Tempo** | http://localhost:3201 | Trazas API |
| **Jaeger UI** | http://localhost:16687 | Trazas (UI) |

#### 4. Acceder a Grafana

```bash
# En el navegador
http://localhost:3002

# Login
username: admin
password: admin
```

#### 5. Dashboard por defecto

Existe un dashboard provisionado automáticamente en:
`observability/grafana/provisioning/dashboards/jasrapo-backend.json`

---

### 🌐 Servidor/Producción

#### 1. Configurar variables de entorno

En `.env` del servidor:

```bash
# ─── Observabilidad ─────────────────────────────────────
# Habilitar métricas
OTEL_METRICS_ENABLED=true

# Endpoint de Tempo para trazas
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318

# Endpoint de Logs (opcional, si usas otro sistema)
LOKI_ENDPOINT=http://loki:3100
```

#### 2. Puertos a exponer

En `compose.yaml`, modificar los puertos expuestos:

```yaml
services:
  prometheus:
    ports:
      - "9090:9090"  # Cambiar de 9091 a 9090

  grafana:
    ports:
      - "3000:3000"  # Cambiar de 3002 a 3000

  loki:
    ports:
      - "3100:3100"  # Cambiar de 3101 a 3100

  tempo:
    ports:
      - "4318:4318"   # OTLP HTTP
      - "4317:4317"   # OTLP gRPC
      - "3200:3200"   # API
      - "16686:16686" # Jaeger UI
```

#### 3. Red de producción

Crear red externa:

```bash
# Crear red
docker network create jasrapo-network

# En el servidor, usar red bridge interna
# No exponer puertos a internet completamente
# Usar nginx reverse proxy
```

#### 4. Seguridad básica

```bash
# Cambiar credenciales de Grafana en producción
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=TU_CONTRASEÑA_segura

# Habilitar SSL con nginx reverse proxy
```

---

## 📊 Configurar Dashboards en Grafana

### Dashboards incluidos

El proyecto incluye:
- `jasrapo-backend.json` - Dashboard básico del backend

### Crear dashboard personalizado

#### Métricas básicas (HTTP)

```promQL
# Requests por segundo
sum by (status) (rate(http_requests_total[5m]))

# Latencia promedio
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Errors por segundo
sum by (code) (rate(error_total[5m]))
```

#### Métricas de sistema

```promQL
# Uso de CPU
rate(process_cpu_seconds_total[5m])

# Memoria
process_resident_memory_bytes

# Event loop lag
process_max_tick_seconds - process_age_seconds
```

#### Logs en Loki

```logql
# Todos los logs del backend
{app="jasrapo-backend"}

# ERROR level
{app="jasrapo-backend"} | level="error"

# Por correlation ID
{app="jasrapo-backend"} | correlation_id="abc123"
```

#### Trazas en Tempo

```
# Buscar por trace ID
service="jasrapo-backend" and name="HTTP POST"

# Por duración
duration > 1s
```

---

## 🔧 Configuración Avanzada

### Prometheus

Archivo: `observability/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'jasrapo-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/api/v1/metrics'
    scrape_interval: 10s
```

### Loki

Archivo: `observability/loki/loki.yml`

```yaml
server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v13
```

### Grafana Datasources

El proyecto already viene configurado con datasources en:
`observability/grafana/provisioning/datasources/datasources.yml`

---

## 🐛 Troubleshooting

### Prometheus no recibe métricas

```bash
# 1. Verificar que el backend exponga métricas
curl http://localhost:3000/api/v1/metrics

# 2. Verificar target en Prometheus
http://localhost:9091/targets

# 3. Verificar configuración
http://localhost:9091/config
```

### Loki no recibe logs

```bash
# 1. Verificar que Loki esté corriendo
curl http://localhost:3101/ready

# 2. Verificar logs en Loki
http://localhost:3101/loki/api/v1/label
```

### Grafana no conecta a datasources

```bash
# Verificar logs de Grafana
docker compose logs grafana

# Verificar red
docker network inspect jasrapo-network
```

### Trazas no aparecen

```bash
# 1. Verificar Tempo
curl http://localhost:3201/ready

# 2. Verificar que el backend envíe trazas
# En el backend:
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
```

---

## 📋 Comandos Útiles

```bash
# Levantar solo observabilidad
docker compose up -d prometheus tempo loki grafana

# Ver logs de un servicio
docker compose logs -f prometheus
docker compose logs -f grafana

# Reiniciar servicio
docker compose restart grafana

# Ver métricas del backend
curl http://localhost:3000/api/v1/metrics

# Estado de Prometheus
curl http://localhost:9091/-/healthy
```

---

## 🔗 Links Útiles

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Loki Docs](https://grafana.com/docs/loki/)
- [Tempo Docs](https://grafana.com/docs/tempo/)
- [OpenTelemetry](https://opentelemetry.io/)

---

## 📝 Variables de Entorno del Backend

| Variable | Descripción | Default |
|---------|------------|--------|
| `OTEL_METRICS_ENABLED` | Habilitar métricas | `true` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint de Tempo | `http://tempo:4318` |
| `LOKI_ENDPOINT` | Endpoint de Loki | `http://loki:3100` |

---

## ⚠️ Notas Importantes

1. **No exponer a internet**: Los puertos de observabilidad no deben estar expuestos directamente. Usar nginx reverse proxy.
2. **Credenciales por defecto**: Cambiar `admin/admin` en producción.
3. **Retención de datos**: Configurar en Prometheus (default: 15d)
4. **Recursos**: Asignar recursos adecuados (mínimo 512MB RAM por servicio)