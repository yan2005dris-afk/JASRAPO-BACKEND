# Guía de Testing — JASRAPO Backend

## Tests Unitarios

### Comandos

```bash
# Ejecutar todos los tests unitarios
npm run test

# Ejecutar en modo watch (desarrollo)
npm run test:watch

# Ejecutar con coverage
npm run test:cov

# Ejecutar test específico por nombre
npm run test -- user

# Debug con inspector
npm run test:debug
```

### Estructura de Archivos

```
backend/src/
├── auth/
│   ├── auth.controller.spec.ts    ✅ Testeado
│   ├── auth.service.spec.ts       ✅ Testeado
│   └── strategies/
├── modules/
│   ├── user/
│   │   ├── user.service.spec.ts ✅ Testeado
│   │   └── user.controller.spec.ts ✅ Testeado
│   ├── sessions/
│   │   ├── sessions.service.spec.ts ✅ Testeado
│   ├── client/
│   │   ├── client.service.spec.ts ✅ Testeado
│   │   └── client.controller.spec.ts ✅ Testeado
│   ├── menus/
│   │   ├── menus.service.spec.ts ✅ Testeado
│   │   └── menus.controller.spec.ts ✅ Testeado
│   ├── categoria-tarifa/
│   │   ├── categoria-tarifa.service.spec.ts ✅ Testeado
│   │   └── categoria-tarifa.controller.spec.ts ✅ Testeado
│   ├── comunidad/
│   │   ├── comunidad.service.spec.ts ✅ Testeado
│   │   └── comunidad.controller.spec.ts ✅ Testeado
│   ├── roles/
│   │   ├── roles.service.spec.ts ✅ Testeado
│   │   └── roles.controller.spec.ts ✅ Testeado
│   ├── permissions/
│   │   ├── permissions.service.spec.ts ✅ Testeado
│   │   └── permissions.controller.spec.ts ✅ Testeado
│   ├── profile/
│   │   ├── profile.service.spec.ts ✅ Testeado
│   │   └── profile.controller.spec.ts ✅ Testeado
│   └── sector/
│       ├── sector.service.spec.ts ✅ Testeado
│       └── sector.controller.spec.ts ✅ Testeado
├── models/
│   ├── medidor/
│   │   ├── medidor.service.spec.ts ✅ Testeado
│   │   └── medidor.controller.spec.ts ✅ Testeado
│   ├── lectura/
│   │   ├── lectura.service.spec.ts ✅ Testeado
│   │   └── lectura.controller.spec.ts ✅ Testeado
│   ├── contrato-medidor/
│   │   ├── contrato-medidor.service.spec.ts ✅ Testeado
│   │   └── contrato-medidor.controller.spec.ts ✅ Testeado
│   └── novedad-operativa/
│       ├── novedad-operativa.service.spec.ts ✅ Testeado
│       └── novelty-operativa.controller.spec.ts ✅ Testeado
├── database/
│   └── prisma.service.spec.ts ✅ Testeado
└── redis/
    └── redis-session.service.spec.ts ✅ Testeado
```

### Patrón de Testing

#### Estructura Básica de un Spec

```typescript
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      users: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      profiles: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      roles: {
        findMany: jest.fn(),
      },
      userPermissions: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user with normalized email', async () => {
      // Arrange
      const dto = { email: 'TEST@Example.COM', password: 'Password123!' };
      
      (prismaService.users.create as jest.Mock).mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@example.com',
      });

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com', ... },
      });
      expect(result.email).toBe('test@example.com');
    });
  });
});
```

#### Mock de Bcrypt para Tests con Hashing

```typescript
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));
```

#### Testing con Excepciones

```typescript
describe('findByEmail', () => {
  it('should throw NotFoundException if user not found', async () => {
    (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

### Módulos Testeados

| Módulo | Estado |
|--------|--------|
| auth/auth.service | ✅ Testeado |
| auth/auth.controller | ✅ Testeado |
| comunidad.service | ✅ Testeado |
| comunidad.controller | ✅ Testeado |
| roles.service | ✅ Testeado |
| roles.controller | ✅ Testeado |
| permissions.service | ✅ Testeado |
| permissions.controller | ✅ Testeado |
| profile.service | ✅ Testeado |
| profile.controller | ✅ Testeado |
| sector.service | ✅ Testeado |
| sector.controller | ✅ Testeado |
| user.service | ✅ Testeado |
| user.controller | ✅ Testeado |
| sessions.service | ✅ Testeado |
| client.service | ✅ Testeado |
| client.controller | ✅ Testeado |
| menus.service | ✅ Testeado |
| menus.controller | ✅ Testeado |
| categoria-tarifa.service | ✅ Testeado |
| categoria-tarifa.controller | ✅ Testeado |
| medidor.service | ✅ Testeado |
| medidor.controller | ✅ Testeado |
| lectura.service | ✅ Testeado |
| lectura.controller | ✅ Testeado |
| contrato-medidor.service | ✅ Testeado |
| contrato-medidor.controller | ✅ Testeado |
| novelty-operativa.service | ✅ Testeado |
| novelty-operativa.controller | ✅ Testeado |
| s3-client.service | ✅ Testeado |
| prisma.service | ✅ Testeado |
| redis-session.service | ✅ Testeado |

### Configuración de Jest

```json
// backend/package.json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Coverage Actual (test:cov)

```
| Métrica | Actual | Target |
|--------|--------|--------|
| Statements | ~55% | 60%+ |
| Branches | ~25% | - |
| Functions | ~50% | 70%+ |
| Lines | ~50% | 60%+ |
```

### Estado Tests

```
Tests:       255 passed, 0 failed, 257 total
Test Suites: 33 passed, 0 failed, 33 total
```

---

## Tests de Integración (E2E)

### Comandos

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Con TestContainers (requiere Docker)
npm run test:e2e

# Fallback (sin Docker, usa mocks)
npm run test:e2e -- --testPathPattern=fallback

# Tests E2E con DB real
export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/jasrapo_e2e"
npm run test:e2e
```

### Estructura

```
backend/test/
├── setup.ts              ✅ Database setup + TestContainers
├── jest-e2e.json         ✅ Config E2E
└── app.e2e-spec.ts       ✅ Tests E2E
```

#### Estado Tests

```
Tests:       255 passed, 0 failed, 257 total
Test Suites: 33 passed, 33 total
```

## Tests E2E Incluidos

#### Phase 1 — Auth Flow

| Test | Descripción |
|------|-------------|
| Register usuario válido | Registro con datos válidos |
| Register email duplicado | Manejo de email existente |
| Register email normalization | Normalización a lowercase |
| Register password weak | Validación de contraseña |
| Login correcto | Login con credenciales válidas |
| Login credenciales inválidas | Manejo de errores |
| Protected routes sin token | Acceso denegado |
| Protected routes con token válido | Acceso permitido |
| Refresh token válido | Renovación de token |
| Refresh token inválido | Manejo de token vencido |
| Logout | Cierre de sesión |

#### Phase 2 — CRUD Operations

| Test | Descripción |
|------|-------------|
| Create Client | Crear cliente |
| Get all Clients | Listar clientes |
| Get Client by ID | Obtener cliente específico |
| Update Client | Actualizar cliente |
| Delete Client | Eliminar cliente |

#### Phase 3 — Storage (S3-compatible)

| Test | Descripción |
|------|-------------|
| Upload file | Subir archivo |
| Download file | Descargar archivo |
| Delete file | Eliminar archivo |

#### Phase 4 — Lecturas

| Test | Descripción |
|------|-------------|
| Create lectura | Registrar lectura |
| Get lecturas by medidor | Listar por medidor |
| Get all lecturas | Listar todas |
| Update lectura | Actualizar |
| Delete lectura | Eliminar |

#### Phase 5 — Contratos

| Test | Descripción |
|------|-------------|
| Create contrato | Crear contrato |
| Get contratos by client | Listar por cliente |
| Get all contratos | Listar todos |
| Update contrato | Actualizar |
| Delete contrato | Eliminar |

#### Phase 6 — Menus & Permissions

| Test | Descripción |
|------|-------------|
| Get menus by role | Menús por rol |
| CRUD permissions | Permisos completos |

### Configuración de E2E

```json
// backend/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Setup de TestContainers

```typescript
// backend/test/setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';

let container: PostgreSqlContainer;
let prisma: PrismaClient;

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer()
    .withDatabase('jasrapo_e2e')
    .withUsername('test')
    .withPassword('test')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();

  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  // Seed data here
  
  return prisma;
}

export async function teardownTestDatabase() {
  if (container) {
    await container.stop();
  }
}

export function getPrismaClient() {
  return prisma;
}
```

### Fallback Mode

Los tests E2E hacen **skip automáticamente** cuando la DB no está disponible, usando respuestas mockeadas:

```typescript
// Si no hay Docker/DB disponible
if (!process.env.TEST_DATABASE_URL) {
  test.skip('requires database', () => {});
}
```

---

## ESLint

### Comandos

```bash
# Ejecutar ESLint
npm run lint

# Con auto-fix
npm run lint

# Verificar sin auto-fix
npx eslint backend/src --no-fix
```

### Configuración

```javascript
// backend/eslint.config.mjs
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'coverage/**', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        // NestJS common
        Request: 'readonly',
        Response: 'readonly',
        Body: 'readonly',
        Param: 'readonly',
        Query: 'readonly',
        Headers: 'readonly',
        Session: 'readonly',
        Next: 'readonly',
      },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'smart'],
    },
  },
  // Relaxed for test files
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
);
```

### Reglas Activas

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `@typescript-eslint/no-unused-vars` | warn | Variables sin usar |
| `@typescript-eslint/no-floating-promises` | error | Promesas sin await |
| `prettier/prettier` | error | Formato de código |
| `no-console` | warn | console.log() |
| `no-debugger` | error | debugger statements |
| `no-var` | error | var deprecated |
| `eqeqeq` | error | === en vez de == |

---

## CI/CD

### Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: ESLint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
        working-directory: backend
      - run: npm run lint
        working-directory: backend

  test:
    name: Tests + Coverage
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
        working-directory: backend
      - run: npm run test:cov
        working-directory: backend
      - uses: codecov/codecov-action@v4
        with:
          directory: ./backend/coverage
          flags: unittests
          name: jasrapo-backend

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
        working-directory: backend
      - run: npm run build
        working-directory: backend
```

### Jobs

| Job | Comando | Descripción |
|-----|---------|-------------|
| **lint** | `npm run lint` | Verifica código |
| **test** | `npm run test:cov` | Ejecuta tests + coverage |
| **build** | `npm run build` | Compila la app |

### Dependencias Externas

- **Node.js**: v20
- **npm**: v9+

---

## Código de Errors Comunes

### "Cannot find module 'bcryptjs'"

```bash
pnpm install bcryptjs
```

### "Cannot read property of undefined"

→ Verificar que el mock de Prisma tiene todos los métodos usados por el servicio.

### "Animation frame" / Jest conflicts

→ En `jest.config.ts`, eliminar `timers: 'real'` si está presente.

### "Async callback was not invoked within 5000 ms"

→ Tests貨async requieren `async/await`.

### "Cannot read properties of undefined (reading 'xxx')"

→ El servicio requiere PrismaService. Agregar mock:

```typescript
providers: [
  MyService,
  { provide: PrismaService, useValue: mockPrismaService },
],
```

---

## Referencias

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest](https://jestjs.io/docs/api)
- [TestContainers](https://testcontainers.com)
- [ESLint](https://eslint.org/docs/latest/)