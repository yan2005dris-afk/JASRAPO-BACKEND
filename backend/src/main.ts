import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './infrastructure/common/filters/global-exception.filter';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ThrottlerExceptionFilter } from './infrastructure/common/filters/throttler-exception.filter';
import { BigIntInterceptor } from './infrastructure/common/interceptors/bigint.interceptor';
import { DecimalToNumberInterceptor } from './infrastructure/common/interceptors/decimal-to-number.interceptor';
import {
  TRUST_PROXY_HOPS,
  TRUST_PROXY_KEY,
} from './infrastructure/config/app.constants';
import { LoggingInterceptor } from './infrastructure/observability/interceptors/logging.interceptor';
import { TracingService } from './infrastructure/observability/tracing/tracing.service';
import { LoggerService } from './infrastructure/observability/logger/logger.service';

type ProxyAwareHttpApp = {
  set: (key: typeof TRUST_PROXY_KEY, value: number) => void;
};

type CookieParserMiddleware = (
  req: unknown,
  res: unknown,
  next: () => void,
) => void;

type CookieParserFactory = () => CookieParserMiddleware;

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Initialize observability
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  const tracingService = app.get(TracingService);

  logger.log('Observability initialized', 'Bootstrap');
  logger.log(`Tracing enabled: ${tracingService.isEnabled()}`, 'Bootstrap');

  app.setGlobalPrefix('api/v1');

  //Interceptor BigInt
  app.useGlobalInterceptors(new BigIntInterceptor());

  //Interceptor Decimal -> Number (para JSON)
  app.useGlobalInterceptors(new DecimalToNumberInterceptor());

  // Logging and Metrics Interceptor
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // filtro para throttler
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // Con Nginx como reverse proxy, la IP real del cliente viene en el
  // header X-Forwarded-For. "trust proxy = 1" le dice a Express que
  // confíe en un nivel de proxy y use ese header para req.ip.
  const httpInstance: unknown = app.getHttpAdapter().getInstance();
  if (httpInstance && typeof httpInstance === 'object') {
    const maybeSet = (httpInstance as { set?: unknown }).set;
    if (typeof maybeSet === 'function') {
      (httpInstance as ProxyAwareHttpApp).set(
        TRUST_PROXY_KEY,
        TRUST_PROXY_HOPS,
      );
    }
  }
  const createCookieParser = cookieParser as unknown as CookieParserFactory;
  app.use(createCookieParser());
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:4200',
  );

  app.enableCors({
    origin:
      corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('JASRAPO API')
    .setDescription(
      `
# API REST de JASRAPO - Sistema de Gestión

## 📋 Descripción
API RESTful para el sistema de gestión de servicios públicos Jasrapo. Cubre operaciones de suministro, facturación, recaudación, reportes y administración del sistema.

## 🔐 Autenticación
La API utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. **Iniciar sesión**: \`POST /auth/login\` con email y contraseña
2. **Obtener token**: Recibirás un \`accessToken\` en la respuesta
3. **Autorizar**: Incluye el token en el header: \`Authorization: Bearer <tu-token>\`
4. **Refresh token**: \`POST /auth/refresh\` renueva tu token automáticamente

**Nota**: El refresh token se almacena en una cookie httpOnly segura.

## 🛡️ Sistema de Permisos
Control de acceso basado en roles y permisos granulares:

- **Permisos**: Cada permiso tiene un nombre, descripción, recurso y acción (ej: \`clientes:read\`, \`users:create\`)
- **Roles**: Los roles agrupan permisos. Un usuario puede tener un rol y/o permisos directos
- **Menús**: Los menús de navegación se filtran automáticamente según los permisos efectivos del usuario
- **Protección**: Cada endpoint protegido valida los permisos del JWT antes de ejecutar la acción

## 📌 Convenciones

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
Los endpoints de listado soportan dos esquemas de paginación:

**Esquema page/limit** (usuarios, rutas, clientes):
- \`page\`: Número de página (default: 1)
- \`limit\`: Registros por página (default: 10)

**Esquema skip/take** (medidores, lecturas, contratos, anomalías):
- \`skip\`: Registros a omitir
- \`take\`: Máximo de registros a retornar

Las respuestas paginadas incluyen metadata: \`total\`, \`paginaActual\`, \`totalPaginas\`, \`anterior\`, \`siguiente\`.

### Soft Delete
Los endpoints de eliminación implementan eliminación lógica (soft delete). Los registros eliminados se marcan con \`borrado_en\` y se excluyen de las consultas normales.

## 📞 Soporte
Para consultas o soporte, contacta al equipo de desarrollo del Backend.
    `,
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT válido',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth(
      'refreshToken',
      {
        description: 'Token de actualización almacenado en cookie (httpOnly)',
        type: 'http',
      },
      'refresh-cookie',
    )
    .addTag(
      'auth',
      'Endpoints de autenticación (login, register, refresh, logout)',
    )
    .addTag('users', 'Gestión de usuarios del sistema')
    .addTag('roles', 'Administración de roles')
    .addTag('permissions', 'Gestión de permisos')
    .addTag('menus', 'Menús y navegación basados en permisos')
    .addTag('clients', 'Gestión de clientes')
    .addTag('sectors', 'Gestión de sectores territoriales')
    .addTag('communities', 'Gestión de comunidades')
    .addTag('contracts', 'Gestión de contratos y medidores')
    .addTag('tariffs', 'Categorías tarifarias')
    .addTag('meters', 'Gestión de medidores')
    .addTag('readings', 'Lecturas de medidores')
    .addTag('reading-anomalies', 'Anomalías de lecturas (fugas, daños)')
    .addTag('routes', 'Planificación y gestión de rutas de lectura')
    .addTag('search', 'Búsqueda pública de información')
    .addTag('Lotes', 'Gestión de lotes de facturación')
    .addTag('agreements', 'Payment agreements')
    .addTag(
      '[En Desarrollo] SRI - Facturación Electrónica',
      'Módulo de facturación electrónica SRI',
    )
    .addTag('[En Desarrollo] Catálogos SRI', 'Catálogos oficiales del SRI')
    .addTag('[En Desarrollo] Emisores', 'Gestión de emisores de comprobantes')
    .addTag('[En Desarrollo] Signature', 'Firma electrónica de documentos')
    .addTag(
      '[En Desarrollo] SRI - Webhooks',
      'Webhooks para notificaciones del SRI',
    )
    .addTag('[En Desarrollo] Certificados', 'Gestión de certificados digitales')
    .addTag(
      '[No Aplicable] Métricas para Prometheus (scraping)',
      'Métricas para Prometheus (scraping)',
    )
    .addServer('http://localhost:3000', 'Servidor de desarrollo')
    .addServer('https://api.dihm-muertos.site/', 'Servidor de pruebas')
    .setContact('Equipo Jasrapo', 'https://jasrapo.com', 'soporte@jasrapo.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  // Intentar cargar metadata del plugin de swagger (generado en build)
  // El plugin genera metadata.json que se carga como funcion
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const metadataFn = require('../metadata');
    if (typeof metadataFn === 'function') {
      await SwaggerModule.loadPluginMetadata(metadataFn);
    }
  } catch {
    // La metadata se genera durante el build con el plugin
    // Si no existe, se usa la documentacion manual con decorators
  }

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .info .title { font-size: 40px }
    `,
    customSiteTitle: 'JASRAPO API Documentation',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

void bootstrap();
