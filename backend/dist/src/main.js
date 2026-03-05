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
        .setDescription('Documentación técnica exhaustiva de la interfaz de programación de aplicaciones (API) de JASRAPO. ' +
        '\nEste recurso detalla la arquitectura de los endpoints, los esquemas de datos y los protocolos de autenticación. ' + '\n' +
        'Diseñada bajo el estándar OpenAPI, permite a los desarrolladores integrar funcionalidades de gestión de recursos de forma modular, ' + '\n' +
        'garantizando la consistencia de los datos y la escalabilidad del sistema mediante una estructura de respuestas estandarizada y manejo de errores robusto.\n\n' +
        '## Características Principales\n' +
        '- **Autenticación JWT**: Sistema de tokens de acceso y refresh con cookies seguras\n' +
        '- **Control de Permisos**: RBAC (Role-Based Access Control) con permisos granulares\n' +
        '- **Gestión de Perfiles**: CRUD completo de perfiles de usuario\n' +
        '- **Menús Dinámicos**: Generación de menús basada en roles y permisos\n' +
        '- **API RESTful**: Endpoints REST con respuestas JSON estandarizadas\n\n' +
        '## Autenticación\n' +
        'La API utiliza autenticación JWT (JSON Web Tokens). Para endpoints protegidos:\n' +
        '\n1. Obtén un token de acceso mediante `/auth/login`' +
        '\n2. Usa el token en el header: `Authorization: Bearer <token>`' + '\n' +
        '\n3. El refresh token se maneja automáticamente mediante cookies HttpOnly' + '\n\n' +
        '## Estandarización de Respuestas\n' +
        'Todos los endpoints siguen un formato de respuesta consistente:' + '\n' +
        '- **Endpoints exitosos**: Retornan el objeto o array de datos solicitados' + '\n' +
        '- **Errores**: Retornan un objeto con `message` describiendo el error\n' + '\n' +
        '- **Listas paginadas**: Retornan arrays con los datos y pueden incluir metadatos de paginación')
        .setVersion('2.0')
        .setContact('Equipo de Desarrollo JASRAPO', 'https://jasrapo.com', 'desarrollo@jasrapo.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token de acceso JWT. Obtén uno en /auth/login',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map