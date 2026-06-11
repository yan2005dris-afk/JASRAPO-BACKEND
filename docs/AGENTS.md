# AGENTS.md - Project Conventions

## Project Stack
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 7.x
- **Database**: PostgreSQL
- **Testing**: Jest + @nestjs/testing + testcontainers

## Code Conventions

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