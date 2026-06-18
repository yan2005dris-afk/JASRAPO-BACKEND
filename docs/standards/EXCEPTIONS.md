# Standard: Exception Handling

Use NestJS built-in exceptions for semantic HTTP error responses. Never throw raw `Error` objects from controllers or services.

---

## Available Exceptions

| Exception | Use Case | HTTP Status |
|-----------|----------|-------------|
| `NotFoundException` | Resource not found | 404 |
| `BadRequestException` | Invalid input / validation | 400 |
| `UnauthorizedException` | Not authenticated | 401 |
| `ForbiddenException` | No permission | 403 |
| `ConflictException` | Duplicate / conflict state | 409 |
| `InternalServerErrorException` | Unexpected error | 500 |

---

## Usage

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// Not found
async getUser(id: bigint): Promise<UserEntity> {
  const user = await this.prisma.usuarios.findUnique({ where: { usuariosId: id } });
  if (!user || user.deletedAt) {
    throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
  }
  return new UserEntity(user);
}

// Validation error
async createUser(dto: CreateUserDto): Promise<UserEntity> {
  if (!this.isValidEmail(dto.email)) {
    throw new BadRequestException('Formato de email inválido');
  }
}

// Conflict / duplicate
async createUser(dto: CreateUserDto): Promise<UserEntity> {
  const existing = await this.prisma.usuarios.findUnique({ where: { email: dto.email } });
  if (existing) {
    throw new ConflictException(`Ya existe un usuario con el email ${dto.email}`);
  }
}

// With cause (for debugging)
throw new NotFoundException('Usuario no encontrado', {
  cause: error,
  description: 'Database query failed',
});
```

---

## Custom Exceptions (domain-specific)

Use only when the built-in exception class doesn't express the domain concept clearly.

```typescript
export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, id: bigint | string) {
    super(`${resource} con ID ${id} no encontrado`);
  }
}

// Usage
throw new ResourceNotFoundException('Medidor', medidorId);
```

---

## Global Exception Filter

Configured in `main.ts` — all unhandled exceptions pass through `HttpExceptionFilter` for consistent response shape.

```typescript
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

Do not catch exceptions just to re-throw them. Let unhandled exceptions bubble to the filter.
