# Standard: Naming & Language

## Language by Context

| Context | Language |
|---------|----------|
| Code (classes, functions, methods, variables) | English |
| Database (tables, columns, enum values) | Spanish |
| Swagger docs (`@ApiOperation`, `@ApiResponse`, `@ApiProperty`) | Spanish |
| Error messages (user-facing) | Spanish |
| Code comments | English |

> See also [INTERFACES.md](./INTERFACES.md) for interface-specific naming rules.

---

## Classes (PascalCase, English)

```typescript
// Controllers
export class UserController {}
export class FieldWorkController {}

// Services
export class UserService {}
export class MeterService {}

// Use Cases
export class GetUserUseCase {}
export class CreateFieldWorkUseCase {}

// Entities
export class UserEntity {}
export class MeterEntity {}

// DTOs
export class CreateUserDto {}
export class UpdateFieldWorkDto {}
```

## Methods & Functions (camelCase, English)

```typescript
async getUser(id: bigint): Promise<UserEntity>
async createUser(dto: CreateUserDto): Promise<UserEntity>
async updateUser(id: bigint, dto: UpdateUserDto): Promise<UserEntity>
async deleteUser(id: bigint): Promise<void>

// Use case entry point
async execute(id: bigint): Promise<UserEntity>
```

## Variables & Parameters (camelCase)

```typescript
const userId = BigInt(id)
const createUserDto = new CreateUserDto()
const filterCriteria = { status: 'active' }
```

## Summary Table

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

---

## Database Naming (Spanish)

Tables and columns use Spanish to maintain concordance with the database schema.

```sql
-- Table names (plural, Spanish)
usuarios
medidores
lecturas
novedades_operativas
contratos
```

### Prisma Schema

```prisma
model Usuarios {
  usuariosId         BigInt    @id @default(autoincrement())
  email              String    @unique
  passwordHash       String
  rolId              Int?
  fechaCreacion      DateTime  @default(now())
  fechaActualizacion DateTime?

  @@map("usuarios")
}
```

Fields in the Prisma model mirror the DB column names — camelCase in TypeScript, snake_case in the actual SQL column via `@map` when needed.
