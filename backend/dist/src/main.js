"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: process.env.CORS_ORIGIN === '*'
            ? true
            : process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',')
                : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        transformOptions: {
            enableImplicitConversion: false,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('JASRAPO API')
        .setDescription(`
# API REST de JASRAPO - Sistema de Gestión

## 📋 Descripción
API RESTful para el sistema de gestión Jasrapo. Proporciona endpoints para la gestión de usuarios, roles, permisos, menús y perfiles.

## 🔐 Autenticación
La API utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. **Iniciar sesión**: Envía tus credenciales a \`/auth/login\` \n
2. **Obtener token**: Recibirás un \`accessToken\` en la respuesta
3. **Autorizar**: Usa el token en el header: \`Authorization: Bearer <tu-token>\`
4. **Refresh token**: Usa el endpoint \`/auth/refresh\` para renovar tu token

**Nota**: El refresh token se almacena automáticamente en una cookie httpOnly.

## 🛡️ Sistema de Permisos
La API implementa un sistema de control de acceso basado en roles y permisos:

- **Recursos**: Entidades del sistema (users, roles, permissions, menus, profile)
- **Acciones**: Operaciones permitidas (create, read, update, delete)
- **Permisos**: Combinación recurso:acción (ej: users:read, users:create)

Cada endpoint está protegido y requiere los permisos correspondientes.

## 📌 convenciones

### Códigos de Respuesta
| Código | Descripción |
|--------|-------------|
| 200 | Solicitud exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Datos inválidos |
| 401 | No autorizado (token inválido o expirado) |
| 403 | Prohibido (sin permisos suficientes) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (recurso duplicado) |
| 500 | Error interno del servidor |

### Paginación
Los endpoints de listado soportan paginación mediante query parameters:
- \`skip\`: Número de registros a omitir \n
- \`take\`: Número máximo de registros a retornar

### Soft Delete
Los endpoints de eliminación implementan eliminación lógica (soft delete), marcando registros como eliminados sin borrarlos físicamente de la base de datos.

## 🏢 Módulos

### Auth (Autenticación)
- \`POST /auth/login\` - Iniciar sesión
- \`POST /auth/register\` - Registrar usuario (requiere permisos) \n
- \`POST /auth/refresh\` - Refresh token
- \`POST /auth/logout\` - Cerrar sesión

### Users (Usuarios)
Gestión completa de usuarios del sistema.

### Roles (Roles)
Administración de roles y asignación de permisos.

### Permissions (Permisos)
Gestión de permisos del sistema.

### Menus (Menús)
Obtención de menús basados en permisos del usuario.

### Profile (Perfiles)
Gestión de perfiles de usuario.

### Files (Archivos)
Subida, descarga, listado y eliminación de archivos mediante MinIO (S3-compatible).
- Soporta subida individual y múltiple
- Genera URLs temporales presigned (24 horas)
- Buckets se crean automáticamente

## 📞 Soporte
Para consultas o soporte, contacta al equipo de desarrollo del Backend.
    `)
        .setVersion('2.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT válido',
        in: 'header',
    }, 'JWT-auth')
        .addCookieAuth('refreshToken', {
        description: 'Token de actualización almacenado en cookie (httpOnly)',
        type: 'http',
    }, 'refresh-cookie')
        .addTag('auth', 'Endpoints de autenticación (login, register, refresh, logout)')
        .addTag('users', 'Gestión de usuarios del sistema')
        .addTag('roles', 'Administración de roles')
        .addTag('permissions', 'Gestión de permisos')
        .addTag('menus', 'Menús y navegación basados en permisos')
        .addTag('profile', 'Gestión de perfiles de usuario')
        .addTag('files', 'Subida, descarga y gestión de archivos (MinIO)')
        .addServer('http://localhost:3000', 'Servidor de desarrollo')
        .setContact('Equipo Jasrapo', 'https://jasrapo.com', 'soporte@jasrapo.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map