# AGENTS.md - Project Conventions

## Project Stack
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 7.x
- **Database**: PostgreSQL
- **Testing**: Jest + @nestjs/testing + testcontainers

## Code Conventions

### Naming Languages
- **Code layer** (classes, methods, variables, constants, files, routes, Swagger tags, permissions): **English**
- **Data layer** (DTO properties, DB columns, enum values): **Spanish** — they map to database columns
- **Swagger docs** (summary, description): **Spanish** — for API consumers

### Naming Patterns
| Layer | Convention | Example |
|-------|------------|---------|
| Classes | PascalCase, English | `BatchService`, `PreInvoiceController` |
| Methods | camelCase, English | `findAll()`, `generate()`, `updateState()` |
| Variables | camelCase | `currentState`, `allowedTransitions` |
| Constants | UPPER_SNAKE_CASE | `PREINVOICE_STATES`, `STATE_TRANSITIONS` |
| Files | kebab-case, English | `create-agreement.dto.ts`, `batch.service.ts` |
| Routes | kebab-case, English | `/batches`, `/pre-invoices`, `/:id/state` |
| DTO properties | camelCase, Spanish | `contratoId`, `numeroCuotas`, `periodoId` |
| Enum values | Spanish | `ACTIVO`, `PENDIENTE_ABONO`, `APROBAR` |

### DTOs & Types
- Use `dto/` folder for request/response objects
- Use `types/` folder for interfaces, selects, and mappers
- Never expose internal fields (deletedAt, createdAt, updatedAt) in DTOs

### Date Handling
- Use `DateUtil` from `infrastructure/common/util/date.util.ts`
- Parse frontend dates with `DateUtil.parseFrontendDate()`
- Format dates for frontend with `DateUtil.formatForFrontend()`
- Frontend format: `YYYY-MM-DD` (string)
- Database format: `Date` objects

### Mappers
- Place mappers in `types/mappers.ts`
- Convert Prisma types to DTOs
- Handle Decimal to number conversion
- Keep mappers pure functions

### Service Layer
- Delegate complex queries to use-cases in `use-cases/`
- Use `safeMeterSelect` for Prisma queries to exclude internal fields
- Inject use-cases via constructor

### Testing
- Unit tests: `*.spec.ts` files in same folder
- Test the public API of services
- Mock Prisma when possible

## File Organization
```
src/
├── metering/meters/
│   ├── dto/           # Request/Response DTOs
│   ├── types/         # Interfaces, selects, mappers
│   ├── use-cases/    # Business logic
│   └── *.service.ts  # Orchestration
```

## Error Handling
- Use NestJS built-in exceptions (BadRequestException, NotFoundException)
- Add validation in DTOs using class-validator

## Prisma Patterns
- Use `safeMeterSelect` from `types/` for queries
- Soft delete: set `deletedAt` instead of hard delete
- Use BigInt for ID fields in TypeScript