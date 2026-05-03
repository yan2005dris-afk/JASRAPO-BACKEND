# JASRAPO - Sistema de Gestión de Medición y Facturación

> Sistema integral para la gestión de medidores, lecturas, facturación y cobranza de servicios de agua potable.

## URLs del Sistema

| Ambiente | URL |
|----------|-----|
| **API (Producción)** | https://api.dihm-muertos.site/ |
| **App Web (Producción)** | https://app.dihm-muertos.site/ |
| **API (Local)** | http://localhost:3000/api/v1 |
| **Swagger UI** | http://localhost:3000/api/docs |

## Tecnologías

| Capa | Tecnología |
|------|-------------|
| **Framework** | NestJS (Node.js 20+) |
| **Lenguaje** | TypeScript |
| **Base de datos** | PostgreSQL 14+ |
| **ORM** | Prisma |
| **API Docs** | Swagger (OpenAPI) |
| **Autenticación** | JWT + Roles + Permisos |
| **Caché** | Redis |
| **Almacenamiento** | MinIO (S3 compatible) |
| **Contenedores** | Docker + Docker Compose |
| **Testing** | Jest |
| **Observabilidad** | Prometheus + Grafana + OpenTelemetry |

## Estructura del Proyecto

```
JASRAPO-BACKEND/
├── backend/                 # Aplicación NestJS
│   ├── src/
│   │   ├── billing/        # Módulo de facturación
│   │   ├── identity/        # Usuarios, roles, permisos
│   │   ├── metering/        # Medidores, lecturas, anomalías
│   │   ├── operations/      # Clientes, contratos, territorio
│   │   ├── public-portal/    # Portal público (búsqueda)
│   │   └── infrastructure/   # Configuración común
│   │       ├── database/    # Prisma service, soft-delete
│   │       ├── common/      # Interceptors, filtros, DTOs
│   │       └── observability/ # Logging, métricas, tracing
│   ├── prisma/             # Schema de DB y migraciones
│   ├── STANDARDS.md        # Convenciones del código
│   └── SWAGGER_GUIDE.md    # Guía de documentación API
├── backend-db/             # Datos iniciales de PostgreSQL
├── observability/          # Config de Prometheus + Grafana
├── docker-compose.yml      # Producción
├── docker-compose.dev.yml  # Desarrollo
└── .env                    # Variables de entorno
```

### Estructura de Carpetas del Backend ( src/ )

```
src/
├── metering/              # Gestión de medidores y lecturas
│   ├── meters/           # CRUD medidores
│   ├── readings/         # Lecturas de medidores
│   └── reading-anomaly/  # Anomalías (fugas, daños)
├── operations/            # Operaciones comerciales
│   ├── customers/        # Clientes
│   ├── contracts/        # Contratos
│   └── territory/        # Comunidades y sectores
├── identity/             # Autenticación y autorización
│   ├── users/
│   ├── roles/
│   └── permissions/
├── billing/             # Facturación
├── public-portal/        # Portal público
└── infrastructure/
    ├── database/        # Prisma service, soft-delete
    ├── common/
    │   ├── interceptors/ # BigInt, Decimal transform
    │   ├── filters/      # Excepciones globales
    │   └── decorators/   # Permisos
    └── observability/
        ├── logging/      # Logs estructurados
        ├── metrics/      # Prometheus
        └── tracing/     # OpenTelemetry
```

## Conventions de Código

- **Código**: Inglés (clases, métodos, variables)
- **Base de datos**: Español (tablas, campos)
- **Swagger**: Español (descripciones, resúmenes)
- **API**: RESTful endpoints
  - `GET /recurso` → listar
  - `GET /recurso/:id` → obtener uno
  - `POST /recurso` → crear
  - `PATCH /recurso/:id` → actualizar
  - `DELETE /recurso/:id` → eliminar (soft delete)
- **Nombres**: singular para clases, plural para endpoints

Ver [STANDARDS.md](./backend/STANDARDS.md) para más detalles.

## Variables de Entorno

```bash
# Copiar de .env.example y configurar
DATABASE_URL=postgresql://user:password@localhost:5432/jasrapo
JWT_SECRET=tu-secret-aqui
REDIS_PASSWORD=tu-redis-password
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
```

## Desarrollo Local

### Prerrequisitos

- Docker Desktop + Docker Compose
- Node.js 20+ (para desarrollo sin Docker)

### Con Docker (Recomendado)

```bash
# Desarrollo con hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Ver logs
docker compose logs -f api

# Acceder a la API
curl http://localhost:3000/api/v1
```

### Sin Docker

```bash
cd backend
npm install
npm run start:dev
```

### Comandos Disponibles

```bash
# Tests
npm test              # Todos los tests
npm run test:cov      # Con coverage

# Linting
npm run lint          # Ver errores
npm run lint:fix      # Auto-arreglar

# Build
npm run build         # Compilar producción
```

## Servicios Externos

| Servicio | Local | Producción |
|----------|-------|------------|
| **PostgreSQL** | localhost:5432 | interno (Docker) |
| **Redis** | localhost:6379 | interno (Docker) |
| **MinIO (API)** | localhost:9000 | interno (Docker) |
| **MinIO (Console)** | localhost:9001 | interno (Docker) |
| **Prometheus** | localhost:9090 | interno (Docker) |
| **Grafana** | localhost:3001 | interno (Docker) |

## Despliegue en Servidor (Docker)

### Production Build

```bash
# Construir y levantar producción
docker compose up -d --build

# Ver estado de servicios
docker compose ps

# Ver logs
docker compose logs -f api
```

### Configuración de Producción

1. Editar `.env` con valores de producción
2. Asegurar que los puertos no estén expuestos a internet
3. Usar redes privadas de Docker entre servicios

## Observabilidad

### Métricas Prometheus

- Endpoint: `http://localhost:9090`
- Métricas automáticas: HTTP requests, memoria, CPU, latencia

### Logs Estructurados

- Formato JSON con contexto (correlation ID, usuario, IP)
- Nivel de log configurable por entorno

### Tracing (OpenTelemetry)

- Integración con Jaeger o compatible
- Rastreo de requests distribuidos

### Dashboard Grafana

- localhost:3001 (default: admin/admin)

## Base de Datos

### Schema Prisma

El schema está en `backend/prisma/schema/`. Cada modelo tiene:

- `deletedAt` para soft delete
- Índices para consultas frecuentes
- Relaciones con cascade appropriate

### Migraciones

```bash
# Crear migración
cd backend
npx prisma migrate dev --name nombre_migracion

# Aplicar en producción
npx prisma migrate deploy

# Resetear DB local
npx prisma migrate reset
```

## API Documentation

Una vez iniciado el servidor:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

Ver [SWAGGER_GUIDE.md](./backend/SWAGGER_GUIDE.md) para ejemplos de documentación.

## Seguridad

- JWT con refresh tokens
- Roles y permisos granulares
- Soft delete en todas las entidades
- Validación de inputs con class-validator
- Rate limiting con Throttler
- Headers de seguridad (Helmet)

## Licencia

MIT