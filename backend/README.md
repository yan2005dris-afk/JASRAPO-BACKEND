# JASRAPO Backend

API REST para gestión de mediciones y lectura de medidores.

## Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL con Prisma ORM
- **API Docs**: Swagger (OpenAPI)
- **Testing**: Jest

## Requisitos

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` basado en `.env.example`:

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar encryption key
openssl rand -hex 16
```

## Compilar y ejecutar

```bash
# Desarrollo
npm run start

# Modo watch
npm run start:dev

# Producción
npm run start:prod
```

## Tests

```bash
# Todos los tests
npm test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## Linting

```bash
# Ver errores
npm run lint

# Auto-arreglar errores
npm run lint:fix
```

## Build

```bash
npm run build
```

## API Documentation

Una vez iniciado el servidor, acceder a:
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## Estándares de código

Ver [STANDARDS.md](./STANDARDS.md) para convenciones del proyecto.

## Guía Swagger

Ver [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md) para ejemplos de documentación.