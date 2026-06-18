# Backend Standards — JASRAPO

Este documento es el índice de todos los estándares de código del proyecto.
Cada sección vive en su propio archivo para facilitar la navegación y el mantenimiento.

## Estándares

| Documento | Descripción |
|-----------|-------------|
| [NAMING.md](./NAMING.md) | Idioma por capa, PascalCase/camelCase, naming de DB (español) |
| [INTERFACES.md](./INTERFACES.md) | Prefijo `I`, campos en español, métodos en inglés |
| [REST-API.md](./REST-API.md) | Endpoints RESTful, CRUD pattern, acciones de negocio |
| [EXCEPTIONS.md](./EXCEPTIONS.md) | `NotFoundException`, `ConflictException`, custom exceptions |
| [LAYERS.md](./LAYERS.md) | Controller → Service → Use Case, DTOs, `class-validator` |

## Convenciones relacionadas

| Documento | Descripción |
|-----------|-------------|
| [../conventions/COMMIT_CONVENTIONS.md](../conventions/COMMIT_CONVENTIONS.md) | Formato de commits convencionales |
| [../guides/SWAGGER_GUIDE.md](../guides/SWAGGER_GUIDE.md) | Decoradores Swagger, documentación de API |
| [../guides/TESTING-GUIDE.md](../guides/TESTING-GUIDE.md) | Tests unitarios, integración, testcontainers |
| [../AGENTS.md](../AGENTS.md) | Tabla rápida de convenciones por capa (referencia para agentes AI) |
