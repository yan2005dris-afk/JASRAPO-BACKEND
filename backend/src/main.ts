import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import ms from 'ms';
import { AppModule } from './app.module';
import {
  TRUST_PROXY_HOPS,
  TRUST_PROXY_KEY,
} from './infrastructure/config/app.constants';
import { resolveCorsOptions } from './infrastructure/config/cors.options';
import { assertAllSecrets } from './infrastructure/config/config.validator';
import { TracingService } from './infrastructure/observability/tracing/tracing.service';
import { LoggerService } from './infrastructure/observability/logger/logger.service';

type CookieParserMiddleware = (
  req: unknown,
  res: unknown,
  next: () => void,
) => void;

type CookieParserFactory = () => CookieParserMiddleware;

/**
 * Hard ceiling for JWT_REFRESH_EXPIRES_IN. A leaked refresh cookie
 * should not grant more than 72h of access. Operators that need
 * longer must set ALLOW_LONG_REFRESH=1 explicitly.
 */
const REFRESH_TOKEN_CEILING_MS = 72 * 60 * 60 * 1000;

/**
 * Validate JWT_REFRESH_EXPIRES_IN at boot. Refuses to start when the
 * configured duration exceeds the safety ceiling unless the operator
 * has explicitly opted in via ALLOW_LONG_REFRESH=1.
 */
function assertRefreshTokenCeiling(configService: ConfigService): void {
  const raw = configService.get<string>('JWT_REFRESH_EXPIRES_IN', '24h');
  const parsed = ms(raw as ms.StringValue);
  if (parsed === undefined) {
    throw new Error(
      `JWT_REFRESH_EXPIRES_IN is not a valid duration: "${raw}". ` +
        `Expected format like "24h" or "7d".`,
    );
  }
  if (parsed <= REFRESH_TOKEN_CEILING_MS) {
    return;
  }
  const allowLong = process.env.ALLOW_LONG_REFRESH === '1';
  if (!allowLong) {
    throw new Error(
      `JWT_REFRESH_EXPIRES_IN="${raw}" exceeds the 72h security ceiling. ` +
        `Set ALLOW_LONG_REFRESH=1 to opt in, or lower the duration.`,
    );
  }
}

async function bootstrap() {
  try {
    assertAllSecrets();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(`\n[FATAL] ${message}\n`);
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Initialize observability
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  const tracingService = app.get(TracingService);

  logger.log('Observability initialized', 'Bootstrap');

  app.setGlobalPrefix('api/v1');

  // Strict default CSP for the whole API. No 'unsafe-inline' scripts here —
  // Swagger UI (which needs it to render) gets its own relaxed policy below,
  // scoped only to /docs.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  // Swagger UI ships inline <script>/<style> tags to bootstrap the docs
  // page, so it needs 'unsafe-inline'. Scope that relaxation to /docs only
  // instead of weakening the CSP for the entire API.
  app.use(
    '/docs',
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  // Aumentar el límite de tamaño para payloads JSON y URL-encoded
  // Nota: Esto solo aplica a JSON/URL-encoded. Las subidas de archivos (multipart/form-data)
  // se manejan de forma independiente mediante interceptores en los controladores.
  app.useBodyParser('json', { limit: '10mb' });
  // Con Nginx como reverse proxy, la IP real del cliente viene en el
  // header X-Forwarded-For. "trust proxy = 1" le dice a Express que
  // confíe en un nivel de proxy y use ese header para req.ip.
  app.set(TRUST_PROXY_KEY, TRUST_PROXY_HOPS);

  const createCookieParser = cookieParser as unknown as CookieParserFactory;
  app.use(createCookieParser());
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:4200',
  );

  app.enableCors(
    resolveCorsOptions({
      corsOrigin,
      credentials: true,
    }),
  );
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
Todos los endpoints de listado soportan paginación mediante los siguientes parámetros:

- \`page\`: Número de página (default: 1)
- \`limit\`: Registros por página (default: 10)

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
        description: 'Ingresa el token JWT de acceso válido',
      },
      'bearer',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT de acceso válido',
      },
      'JWT',
    )
    .addCookieAuth(
      'refreshToken',
      {
        description: 'Token de actualización almacenado en cookie (httpOnly)',
        type: 'apiKey',
        in: 'cookie',
      },
      'refreshToken',
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
    .addTag('tariff-categories', 'Categorías tarifarias (tarifas por consumo)')
    .addTag('meters', 'Gestión de medidores')
    .addTag('readings', 'Lecturas de medidores')
    .addTag('reading-anomalies', 'Anomalías de lecturas (fugas, daños)')
    .addTag('routes', 'Planificación y gestión de rutas de lectura')
    .addTag('search', 'Búsqueda pública de información')
    .addTag('batches', 'Billing batch management')
    .addTag('pre-invoices', 'Gestión de prefacturas')
    .addTag('agreements', 'Payment agreements')
    .addTag('reports', 'Generación de reportes y documentos PDF')
    .addTag(
      '[SRI] Facturación Electrónica',
      'Módulo de facturación electrónica SRI',
    )
    .addTag('[SRI] Catálogos', 'Catálogos oficiales del SRI')
    .addTag('[SRI] Emisores', 'Gestión de emisores de comprobantes')
    .addTag('[SRI] Firma (XAdES-BES)', 'Firma electrónica de documentos')
    .addTag('[SRI] Webhooks', 'Webhooks para notificaciones del SRI')
    .addTag('[SRI] Certificados', 'Gestión de certificados digitales')
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

  app.enableShutdownHooks();

  assertRefreshTokenCeiling(configService);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`Tracing enabled: ${tracingService.isEnabled()}`, 'Bootstrap');
}

void bootstrap();
