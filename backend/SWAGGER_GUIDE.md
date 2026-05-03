# Guía Completa de Documentación con Swagger en Nest.js

## 📋 Estado Actual de tu Proyecto

Tu proyecto **ya tiene Swagger instalado y configurado parcialmente**. Puedes acceder a la documentación en:
- **URL local**: `http://localhost:3000/docs`
- **URL con prefijo API**: `http://localhost:3000/api/v1/docs`

---

## 🎯 Objetivo

El objetivo es documentar TODA tu API para que:
1. Los desarrolladores consuman la API fácilmente
2. Se generen ejemplos automáticos de Request/Response
3. La documentación sea interactiva (probable directamente desde Swagger UI)

---

## 📦 Decoradores de Swagger Disponibles

### Decoradores Principales

| Decorador | Uso | Ejemplo |
|-----------|-----|---------|
| `@ApiTags('nombre')` | Agrupa endpoints en categorías | `@ApiTags('users')` |
| `@ApiBearerAuth()` | Indica que requiere autenticación JWT | `@ApiBearerAuth()` |
| `@ApiOperation({ summary, description })` | Describe la operación | `@ApiOperation({ summary: 'Crear usuario' })` |
| `@ApiResponse({ status, description, type })` | Documenta respuestas HTTP | `@ApiResponse({ status: 201, description: 'Usuario creado' })` |
| `@ApiParam({ name, description, example })` | Documenta parámetros de ruta | `@ApiParam({ name: 'id', description: 'ID del usuario' })` |
| `@ApiQuery({ name, description, required, example })` | Documenta query params | `@ApiQuery({ name: 'skip', description: 'Número de registros a omitir' })` |
| `@ApiBody({ type })` | Documenta el cuerpo de la petición | `@ApiBody({ type: CreateUserDto })` |
| `@ApiProperty({ description, example, required, enum, type, format, nullable, readOnly })` | Documenta propiedades del DTO | `@ApiProperty({ description: 'Email del usuario', example: 'user@test.com' })` |
| `@ApiPropertyOptional()` | Para propiedades opcionales | Similar a `@ApiProperty` pero indica que es opcional |
| `@ApiHeader({ name, description, required, example })` | Documenta headers | `@ApiHeader({ name: 'X-Request-ID' })` |

---

## 📝 Guía Paso a Paso para Documentar

### Paso 1: Documentar los DTOs (Data Transfer Objects)

Los DTOs definen la estructura de datos. Debes agregar `@ApiProperty` a cada campo.

#### Ejemplo 1: DTO de Login (Antes y Después)

**ANTES (actual):**
```typescript
// src/auth/dto/login-user.dto.ts
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  password: string;
}
```

**DESPUÉS (documentado):**
```typescript
// src/auth/dto/login-user.dto.ts
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@jasrapo.com',
    format: 'email',
    required: true,
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres, sin espacios)',
    example: 'Password123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  password: string;
}
```

#### Ejemplo 2: DTO de Registro

**ANTES (actual):**
```typescript
// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe tener al menos una mayúscula, un número y un carácter especial (!@#$%^&*)',
  })
  password: string;
}
```

**DESPUÉS (documentado):**
```typescript
// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del nuevo usuario',
    example: 'nuevo@jasrapo.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 6 caracteres, debe contener al menos una mayúscula, un número y un carácter especial)',
    example: 'SecurePass123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe tener al menos una mayúscula, un número y un carácter especial (!@#$%^&*)',
  })
  password: string;
}
```

#### Ejemplo 3: DTO de Crear Usuario

**ANTES (actual):**
```typescript
// src/modules/user/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**DESPUÉS (documentado):**
```typescript
// src/modules/user/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario (debe ser único)',
    example: 'usuario@jasrapo.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'Password123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

---

### Paso 2: Documentar los Controladores

Los controladores definen los endpoints. Debes agregar decoradores de Swagger a cada método.

#### Estructura Base de un Controlador Documentado

```typescript
import { Controller, Get, Post, Body, Param, ... } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

// 1.@ApiTags: Agrupa los endpoints por categoría
@ApiTags('users')
// 2. @ApiBearerAuth: Indica que todos los endpoints requieren autenticación
@ApiBearerAuth()
@Controller('users')
export class UserController {
  
  /**
   * CREAR USUARIO
   */
  @ApiOperation({ 
    summary: 'Crear un nuevo usuario', 
    description: 'Crea un nuevo usuario en el sistema con email y contraseña' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    type: CreateUserDto // Puedes especificar el tipo de respuesta
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El correo electrónico ya está en uso' 
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * OBTENER TODOS LOS USUARIOS (CON PAGINACIÓN)
   */
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios', 
    description: 'Retorna una lista de usuarios con soporte para paginación mediante query parameters' 
  })
  @ApiQuery({ 
    name: 'skip', 
    description: 'Número de registros a omitir (para paginación)', 
    required: false, 
    example: 0,
    type: Number 
  })
  @ApiQuery({ 
    name: 'take', 
    description: 'Número de registros a obtener (límite)', 
    required: false, 
    example: 10,
    type: Number 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente' 
  })
  @Get()
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.findAll({ skip, take });
  }

  /**
   * OBTENER USUARIO POR ID
   */
  @ApiOperation({ 
    summary: 'Obtener usuario por ID', 
    description: 'Retorna los datos de un usuario específico incluyendo sus roles y permisos' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del usuario', 
    type: Number,
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  /**
   * ELIMINAR USUARIO
   */
  @ApiOperation({ 
    summary: 'Eliminar usuario (Soft Delete)', 
    description: 'Marca un usuario como eliminado sin borrarlo de la base de datos' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único del usuario a eliminar', 
    type: Number,
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
```

---

### Paso 3: Mejorar la Configuración de Swagger (main.ts)

Puedes personalizar aún más tu documentación en `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  
  // Configuración de Express
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());
  
  // CORS
  app.enableCors({
    origin:
      process.env.CORS_ORIGIN === '*'
        ? true
        : process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN.split(',')
          : true,
    credentials: true,
  });

  // Pipes de validación
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // ========================================
  // CONFIGURACIÓN DE SWAGGER MEJORADA
  // ========================================
  const config = new DocumentBuilder()
    .setTitle('JASRAPO API')
    .setDescription(`
## Descripción
API REST para el sistema de gestión de Jasrapo.

### Autenticación
Esta API utiliza JWT (JSON Web Tokens) para la autenticación.
1. Obtén un token accediendo a \`/auth/login\`
2. Usa el token en el header: \`Authorization: Bearer <tu-token>\`

### Permisos
Los endpoints están protegidos por permisos. Cada usuario tiene roles y permisos asignados.

### Versiones
- **v1**: Versión actual de la API
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Nombre del bearer auth para múltiples autenticaciones
    )
    .addCookieAuth(
      'refreshToken',
      {
        description: 'Token de refresh almacenado en cookie',
        type: 'http',
      },
      'refresh-cookie',
    )
    .addTag('auth', 'Endpoints de autenticación (login, register, refresh, logout)')
    .addTag('users', 'Gestión de usuarios')
    .addTag('roles', 'Gestión de roles')
    .addTag('permissions', 'Gestión de permisos')
    .addTag('menus', 'Gestión de menús')
    .addTag('profile', 'Gestión de perfiles')
    .addServer('http://localhost:3000', 'Servidor de desarrollo')
    .setContact('Equipo Jasrapo', 'https://jasrapo.com', 'soporte@jasrapo.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Personalizar opciones de Swagger UI
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token al recargar
      displayRequestDuration: true, // Muestra la duración de las peticiones
      docExpansion: 'none', // Expande los grupos (list, full, none)
      filter: true, // Muestra el filtro de operaciones
      showExtensions: true, // Muestra extensiones de OpenAPI
      showCommonExtensions: true, // Muestra extensiones comunes
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .info .title { font-size: 40px }
    `,
    customSiteTitle: 'JASRAPO API Documentation',
    customfavIcon: '/favicon.ico',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${process.env.PORT ?? 3000}/docs`);
}

bootstrap();
```

---

## 📋 Checklist de Documentación

### DTOs Documentados

| DTO | Archivo | Estado |
|-----|---------|--------|
| LoginUserDto | `src/identity/auth/dto/login-user.dto.ts` | ✅ Documentado |
| RegisterDto | `src/identity/auth/dto/register.dto.ts` | ✅ Documentado |
| CreateUserDto | `src/identity/users/dto/create-user.dto.ts` | ✅ Documentado |
| UpdateUserDto | `src/identity/users/dto/update-user.dto.ts` | ✅ Partial |
| AssignRoleDto | `src/identity/users/dto/assign-role.dto.ts` | ✅ Documentado |
| AssignPermissionDto | `src/identity/users/dto/assign-permission.dto.ts` | ✅ Documentado |
| CreateRoleDto | `src/identity/roles/dto/create-role.dto.ts` | ✅ Documentado |
| UpdateRoleDto | `src/identity/roles/dto/update-role.dto.ts` | ✅ Partial |
| AssignRolePermissionDto | `src/identity/roles/dto/assign-role-permission.dto.ts` | ✅ Documentado |
| CreateMenuDto | `src/identity/menus/dto/create-menu.dto.ts` | ✅ Documentado |
| UpdateMenuDto | `src/identity/menus/dto/update-menu.dto.ts` | ✅ Partial |
| CreateProfileDto | `src/identity/profiles/dto/create-profile.dto.ts` | ✅ Documentado |
| UpdateProfileDto | `src/identity/profiles/dto/update-profile.dto.ts` | ✅ Partial |
| CreatePermissionDto | `src/identity/permissions/dto/create-permission.dto.ts` | ✅ Documentado |
| UpdatePermissionDto | `src/identity/permissions/dto/update-permission.dto.ts` | ✅ Partial |
| CrearMedidorDto | `src/metering/devices/dto/create-medidor.dto.ts` | ✅ Documentado |
| ActualizarMedidorDto | `src/metering/devices/dto/update-medidor.dto.ts` | ✅ Partial |
| CrearLecturaDto | `src/metering/readings/dto/create-lectura.dto.ts` | ✅ Documentado |
| CreateClientDto | `src/operations/customers/dto/create-client.dto.ts` | ✅ Documentado |
| UpdateClientDto | `src/operations/customers/dto/update-client.dto.ts` | ✅ Partial |

### Controladores Documentados (Actualizado)

| Controlador | Endpoint | Estado |
|-------------|----------|--------|
| AuthController | `/auth` | ✅ Completo |
| UserController | `/users` | ✅ Documentado |
| RolesController | `/roles` | ✅ Documentado |
| PermissionsController | `/permissions` | ✅ Documentado |
| MenusController | `/menus` | ✅ Documentado |
| ProfileController | `/profile` | ✅ Documentado |
| FilesController | `/files` | ✅ Documentado |
| ClientController | `/clients` | ✅ Actualizado (ingles + plural) |
| SectorController | `/sectors` | ✅ Actualizado (plural) |
| ComunidadController | `/communities` | ✅ Actualizado (ingles + plural) |
| MedidorController | `/meters` | ✅ Actualizado (ingles + plural) |
| LecturaController | `/readings` | ✅ Actualizado (ingles + plural) |
| BusquedaPublicaController | `/search` | ✅ Actualizado (ingles) |
| NovedadOperativaController | `/field-notes` | ✅ Actualizado (ingles) |
| ContratoMedidorController | `/contracts` | ✅ Actualizado (ingles + plural) |
| CategoriaTarifaController | `/tariff-categories` | ✅ Actualizado (kebab-case) |

---

## 📐 Estándares de Naming (Conventions)

Siguiendo el documento de **API Design Standards & Naming Conventions**, todos los endpoints deben cumplir:

### Reglas Aplicadas

| Regla | Ejemplo |
|-------|---------|
| **Plural** | ✅ `/users` ❌ `/user` |
| **Kebab-case** | ✅ `/tariff-categories` ❌ `/tariffCategories` |
| **Inglés** | ✅ `/meters` ❌ `/medidores` |
| **Sin verbos** | ✅ `GET /meters` ❌ `GET /get-meters` |
| **HTTP Methods** | ✅ `POST /meters`, `GET /meters/:id` ❌ `POST /meters/create` |

### Patrón RESTful Estándar

```text
Método HTTP  Endpoint              Descripción
-----------  -------------------  -----------------------
GET          /meters              Listar todos los medidores
GET          /meters/:id          Obtener un medidor específico
POST         /meters              Crear un nuevo medidor
PATCH        /meters/:id          Actualizar un medidor
DELETE      /meters/:id           Eliminar un medidor (soft delete)
```

### Acciones de Negocio (sub-recursos)

```text
POST         /meters/:id/install      Instalar medidor en contrato
POST         /meters/:id/decommission   Dar de baja medidor
GET          /meters/search           Búsqueda avanzada
```

### Endpoints Actualizados

| Anterior (Español) | Nuevo (Estándar RESTful) |
|-------------------|-------------------------|
| `/medidores/create` | `POST /meters` |
| `/medidores/get-all` | `GET /meters` |
| `/medidores/get-one/:id` | `GET /meters/:id` |
| `/medidores/update` | `PATCH /meters/:id` |
| `/medidores/remove/:id` | `DELETE /meters/:id` |
| `/lecturas/create` | `POST /readings` |
| `/lecturas/get-all` | `GET /readings` |
| `/lecturas/get-one/:id` | `GET /readings/:id` |

### Excepciones Válidas

Estos patrones NO requieren migración porque son excepciones legítimas:

| Endpoint | Razón |
|----------|-------|
| `/auth/login`, `/auth/register`, `/auth/logout` | Autenticación (no es recurso) |
| `/profile` | Singleton por usuario |
| `/search` | Búsqueda avanzada con query params |
| `/files/upload`, `/files/upload-multiple` | Acciones de negocio específicas |
| `/menus/my` | Sub-recurso del usuario actual |
| `/meters/:id/install`, `/meters/:id/decommission` | Acciones de negocio |

### Tags de Swagger (main.ts)

```typescript
.addTag('auth', 'Endpoints de autenticación')
.addTag('users', 'Gestión de usuarios del sistema')
.addTag('roles', 'Administración de roles')
.addTag('permissions', 'Gestión de permisos')
.addTag('menus', 'Menús y navegación basados en permisos')
.addTag('profile', 'Gestión de perfiles de usuario')
.addTag('files', 'Subida, descarga y gestión de archivos (MinIO)')
.addTag('clients', 'Gestión de clientes')
.addTag('sectors', 'Gestión de sectores territoriales')
.addTag('communities', 'Gestión de comunidades')
.addTag('field-notes', 'Notas operativas de campo')
.addTag('contracts', 'Gestión de contratos y medidores')
.addTag('tariffs', 'Categorías tarifarias')
.addTag('meters', 'Gestión de medidores')
.addTag('readings', 'Lecturas de medidores')
.addTag('search', 'Búsqueda pública de información')
```

---

## 🚀 Comandos Útiles

### Iniciar el servidor con Swagger

```bash
# En el directorio backend
cd backend

# Modo desarrollo
npm run start:dev

# El servidor estará disponible en:
# - API: http://localhost:3000/api/v1
# - Swagger: http://localhost:3000/docs
```

### Verificar la configuración de Swagger

Una vez iniciado el servidor, visita:
- `http://localhost:3000/docs` - Documentación Swagger UI
- `http://localhost:3000/docs-json` - especificación OpenAPI en JSON
- `http://localhost:3000/docs-yaml` - Especificación OpenAPI en YAML

---

## 💡 Mejores Prácticas

1. **Siempre proporciona ejemplos**: Usa `example: 'valor'` en `@ApiProperty`
2. **Describe cada propiedad**: Usa `description: 'texto descriptivo'`
3. **Documenta todas las respuestas**: Especialmente los casos de error (400, 401, 404, 500)
4. **Usa enums cuando corresponda**: Si un campo tiene valores fijos, usa el parámetro `enum`
5. **Agrupa lógicamente**: Usa `@ApiTags` para grouping claro
6. **Mantén la consistencia**: Sigue el mismo formato de descripción en toda la API
7. **Actualiza la documentación**: Cuando cambies un endpoint, actualiza su documentación

---

## 📌 Notas Adicionales

- **Autenticación**: Tu API usa JWT. Los usuarios deben obtener un token en `/auth/login` y usarlo en el header `Authorization: Bearer <token>`
- **Permisos**: Los endpoints están protegidos por el sistema de permisos. El `@RequiredPermission` decorator controla el acceso
- **Soft Delete**: Tu sistema usa eliminación lógica (soft delete), no física
- **Paginación**: Los endpoints de lista soportan paginación con `skip` y `take`

---

## 🎓 Ejemplo Completo: Aplicando a un Controlador

Aquí tienes un ejemplo de cómo debería verse el `UserController` completamente documentado:

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Crea un nuevo usuario en el sistema.
   * Requiere permiso: users:create
   */
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario con email y contraseña. El email debe ser único en el sistema.',
  })
  @ApiBody({ type: CreateUserDto, description: 'Datos del usuario a crear' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        usersId: 1,
        email: 'nuevo@jasrapo.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido o expirado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:create' })
  @ApiResponse({ status: 409, description: 'Conflicto - El email ya existe' })
  @RequiredPermission('users', 'create')
  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Obtiene todos los usuarios con paginación opcional.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Retorna una lista paginada de usuarios. Si no se especifican parámetros de paginación, retorna todos los usuarios.',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Número de registros a omitir (para paginación)',
    required: false,
    example: 0,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'Número máximo de registros a retornar',
    required: false,
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @RequiredPermission('users', 'read')
  @Get('/')
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.userService.users({
      skip: skip ?? undefined,
      take: take ?? undefined,
    });
  }

  /**
   * Obtiene un usuario específico por su ID.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna los datos de un usuario específico, incluyendo sus roles y permisos asignados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:read' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.user({ usersId: id });
  }

  /**
   * Obtiene los roles asignados a un usuario.
   * Requiere permiso: users:read
   */
  @ApiOperation({
    summary: 'Obtener roles de usuario',
    description: 'Retorna los roles asignados a un usuario específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario obtenidos exitosamente',
  })
  @RequiredPermission('users', 'read')
  @Get(':id/roles')
  getUserRoles(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getRolesByUserId(id);
  }

  /**
   * Actualiza los datos de un usuario.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos básicos de un usuario (email o contraseña).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateUserDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:update' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'update')
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser({
      where: { usersId: id },
      data: {
        email: updateUserDto.email,
        password: updateUserDto.password,
      },
    });
  }

  /**
   * Asigna un rol a un usuario.
   * Requiere permiso: users:update
   */
  @ApiOperation({
    summary: 'Asignar rol a usuario',
    description: 'Asigna un rol adicional a un usuario existente. No elimina los roles anteriores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: AssignRoleDto,
    description: 'ID del rol a asignar',
    examples: {
      ejemplo1: {
        value: { rolesId: 2 },
        summary: 'Asignar rol de Editor',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:update' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @RequiredPermission('users', 'update')
  @Post(':id/roles')
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.userService.assignRoleToUser(id, assignRoleDto.rolesId);
  }

  /**
   * Elimina un usuario (Soft Delete).
   * Requiere permiso: users:delete
   */
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Marca un usuario como eliminado (soft delete). El usuario no se borra permanentemente de la base de datos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:delete' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @RequiredPermission('users', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDeleteUser({ usersId: id });
  }
}
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [Paquete @nestjs/swagger en npm](https://www.npmjs.com/package/@nestjs/swagger)
- [OpenAPI Specification](https://swagger.io/specification/)

---

*Esta guía fue creada para el proyecto JASRAPO-BACKEND*

