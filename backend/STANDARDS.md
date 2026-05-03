# Backend Standards - JASRAPO

This document defines the coding standards and conventions for the JASRAPO backend.

---

## 1. Language

| Context | Language |
|---------|----------|
| Code (classes, functions, methods, variables) | English |
| Database (tables, columns, values) | Spanish |
| Swagger Documentation (@ApiOperation, @ApiResponse, @ApiProperty) | **Spanish** |
| Error messages | Spanish (user-facing) |
| Comments | English |

---

## 2. Naming Conventions

### Classes (PascalCase)

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

### Functions & Methods (camelCase)

```typescript
// Service methods
async getUser(id: bigint): Promise<UserEntity>
async createUser(dto: CreateUserDto): Promise<UserEntity>
async updateUser(id: bigint, dto: UpdateUserDto): Promise<UserEntity>
async deleteUser(id: bigint): Promise<void>

// Use case execute method
async execute(id: bigint): Promise<UserEntity>
```

### Variables & Parameters (camelCase)

```parameter name="filePath">const userId = BigInt(id)
const createUserDto = new CreateUserDto()
const filterCriteria = { status: 'active' }
```

---

## 3. REST API Endpoints (Estándar RESTful)

**Principio**: Usar métodos HTTP para acciones, no verbos en la URL.

### Patrón Estándar

| Método HTTP | Endpoint | Descripción |
|-------------|----------|-------------|
| `GET` | `/meters` | Listar todos los medidores (colección) |
| `GET` | `/meters/:id` | Obtener un medidor específico |
| `POST` | `/meters` | Crear un nuevo medidor |
| `PATCH` | `/meters/:id` | Actualizar un medidor |
| `DELETE` | `/meters/:id` | Eliminar un medidor (soft delete) |

### Acciones de Negocio (no-CRUD)

Para operaciones que no son CRUD estándar, usar sub-recursos:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/meters/:id/install` | Instalar medidor en contrato |
| `POST` | `/meters/:id/decommission` | Dar de baja medidor |
| `POST` | `/meters/:id/report-defect` | Reportar daño |

### Controller Example

```typescript
@ApiTags('meters')
@ApiBearerAuth()
@Controller('meters')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  // CRUD: Crear
  @Post()
  @RequiredPermission('meters', 'create')
  async create(@Body() dto: CreateMeterDto): Promise<MeterResponseDto> {
    return this.meterService.create(dto);
  }

  // CRUD: Listar (colección)
  @Get()
  @RequiredPermission('meters', 'read')
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<MeterResponseDto[]> {
    return this.meterService.findAll({ skip, take });
  }

  // CRUD: Obtener uno
  @Get(':id')
  @RequiredPermission('meters', 'read')
  async findOne(@Param('id') id: string): Promise<MeterResponseDto> {
    return this.meterService.findOne(BigInt(id));
  }

  // CRUD: Actualizar
  @Patch(':id')
  @RequiredPermission('meters', 'update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    return this.meterService.update(BigInt(id), dto);
  }

  // CRUD: Eliminar
  @Delete(':id')
  @RequiredPermission('meters', 'delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.meterService.remove(BigInt(id));
  }

  // Acción de negocio
  @Post(':id/install')
  @RequiredPermission('meters', 'update')
  async install(
    @Param('id') id: string,
    @Body('contratoId') contratoId: string,
  ): Promise<MeterResponseDto> {
    return this.meterService.install(BigInt(id), BigInt(contratoId));
  }
}
```

### Reglas de Naming

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Plural para colecciones | `/meters` | `/meter` |
| Verbos en URL | `GET /meters` | `GET /get-all-meters` |
| Minusculas | `/users` | `/Users` |
| kebab-case | `/tariff-categories` | `/tariffCategories` |
| Sin trailing slash | `/meters` | `/meters/` |

### Excepciones Válidas

- `/auth/login` - No es un recurso, es una acción de autenticación
- `/profile` - Singleton por usuario (no colección)
- `/search` - Búsqueda avanzada con query params

---

## 4. Exception Handling

Use NestJS built-in exceptions for semantic error responses.

### Available Exceptions

| Exception | Use Case | HTTP Status |
|-----------|----------|--------------|
| `NotFoundException` | Resource not found | 404 |
| `BadRequestException` | Invalid input / validation | 400 |
| `UnauthorizedException` | Not authenticated | 401 |
| `ForbiddenException` | No permission | 403 |
| `ConflictException` | Duplicate / conflict | 409 |
| `InternalServerErrorException` | Unexpected error | 500 |

### Usage Examples

```typescript
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

// Not Found
async getUser(id: bigint): Promise<UserEntity> {
  const user = await this.prisma.users.findUnique({ where: { usersId: id } });
  if (!user || user.deletedAt) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return new UserEntity(user);
}

// Bad Request
async createUser(dto: CreateUserDto): Promise<UserEntity> {
  if (!dto.email) {
    throw new BadRequestException('Email is required');
  }
  if (!this.isValidEmail(dto.email)) {
    throw new BadRequestException('Invalid email format');
  }
}

// Conflict (duplicate)
async createUser(dto: CreateUserDto): Promise<UserEntity> {
  const existing = await this.prisma.users.findUnique({
    where: { email: dto.email }
  });
  if (existing) {
    throw new ConflictException(`User with email ${dto.email} already exists`);
  }
}

// With error cause
throw new NotFoundException('User not found', {
  cause: error,
  description: 'Database query failed'
});
```

### Custom Exceptions (Optional)

```typescript
// For domain-specific errors
export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, id: bigint) {
    super(`${resource} with ID ${id} not found`);
  }
}

// Usage
throw new ResourceNotFoundException('User', userId);
```

### Global Exception Filter

Ensure you have a global exception filter for consistent error responses:

```typescript
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 5. Layered Architecture

```
src/
├── module/
│   ├── dto/                 # Data Transfer Objects
│   │   ├── create-xxx.dto.ts
│   │   └── update-xxx.dto.ts
│   ├── entities/            # Domain Entities
│   │   └── xxx.entity.ts
│   ├── use-cases/           # Business Logic
│   │   ├── get-xxx.use-case.ts
│   │   ├── create-xxx.use-case.ts
│   │   └── ...
│   ├── xxx.controller.ts   # HTTP Layer
│   └── xxx.service.ts      # Orchestration (optional)
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Controller** | HTTP handling, validation, auth checks, delegates to service/use-cases |
| **Service** | Orchestrates use-cases, cross-cutting concerns |
| **Use Case** | Single business operation, pure logic |
| **Entity** | Domain model, data transformation |
| **DTO** | Input/output validation and transformation |

### Use Case Pattern

```typescript
@Injectable()
export class GetUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<UserEntity> {
    const user = await this.prisma.users.findUnique({
      where: { usersId: id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserEntity(user);
  }
}
```

---

## 6. DTOs and Validation

### Create DTO

```typescript
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
```

### Update DTO (Partial)

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## 7. Database Naming (Spanish)

Tables and columns in Spanish:

```sql
-- Table names (singular, Spanish)
usuarios
medidores
lecturas
novedades_operativas
contratos

-- Columns (camelCase in SQL, Spanish)
usuarios_id
email
password_hash
fecha_creacion
fecha_actualizacion
medidores_id
numero_serie
```

### Prisma Schema

```prisma
model Usuarios {
  usuariosId      BigInt        @id @default(autoincrement())
  email           String        @unique
  passwordHash   String
  rolId          Int?
  fechaCreacion  DateTime      @default(now())
  fechaActualizacion DateTime?

  @@map("usuarios")
}
```

---

## 8. Code Example: Complete CRUD

### Controller

```typescript
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserEntity })
  @RequiredPermission('users', 'create')
  async createUser(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(dto);
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  @RequiredPermission('users', 'read')
  async getAllUsers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<UserEntity[]> {
    return this.userService.getUsers({ skip, take });
  }

  @Get('get-one')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  @RequiredPermission('users', 'read')
  async getUser(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.getUser(BigInt(id));
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @RequiredPermission('users', 'update')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser(BigInt(id), dto);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User removed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @RequiredPermission('users', 'delete')
  async removeUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(BigInt(id));
  }
}
```

### Service

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    return this.createUserUseCase.execute(dto);
  }

  async getUsers(params: { skip?: number; take?: number }): Promise<UserEntity[]> {
    const users = await this.prisma.usuarios.findMany({
      skip: params.skip,
      take: params.take,
      where: { deletedAt: null },
    });
    return users.map(u => new UserEntity(u));
  }

  async getUser(id: bigint): Promise<UserEntity> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuariosId: id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserEntity(user);
  }

  async updateUser(id: bigint, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuariosId: id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updated = await this.prisma.usuarios.update({
      where: { usuariosId: id },
      data: dto,
    });
    return new UserEntity(updated);
  }

  async deleteUser(id: bigint): Promise<void> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuariosId: id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.prisma.usuarios.update({
      where: { usuariosId: id },
      data: { deletedAt: new Date() },
    });
  }
}
```

### Use Case

```typescript
@Injectable()
export class GetUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<UserEntity> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuariosId: id },
    });
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserEntity(user);
  }
}
```

---

## 9. Migration Guide

To migrate existing code to these standards:

1. **Rename methods** from Spanish to English camelCase:
   - `crearUsuario` → `createUser`
   - `buscarUsuario` → `getUser`
   - `actualizarUsuario` → `updateUser`
   - `eliminarUsuario` → `deleteUser`

2. **Rename endpoints** from RESTful to field-work pattern:
   - `POST /usuarios` → `POST /users/create`
   - `GET /usuarios` → `GET /users/get-all`
   - `GET /usuarios/:id` → `GET /users/get-one/:id`
   - `PATCH /usuarios/:id` → `PATCH /users/update/:id`
   - `DELETE /usuarios/:id` → `DELETE /users/remove/:id`

3. **Ensure exceptions** are properly used:
   - Use `NotFoundException` when resource doesn't exist
   - Use `BadRequestException` for validation errors
   - Use `ConflictException` for duplicates

---

## 10. Quick Reference

| Rule | Example |
|------|---------|
| Class name | `UserController`, `GetUserUseCase` |
| Method/function | `getUser`, `createUser`, `updateUser` |
| Endpoint | `/users/create`, `/users/get-all` |
| Variable | `userId`, `createUserDto` |
| Database table | `usuarios`, `medidores` |
| Database column | `usuariosId`, `fechaCreacion` |
| Not found | `throw new NotFoundException(...)` |
| Bad request | `throw new BadRequestException(...)` |
| Conflict | `throw new ConflictException(...)` |