import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // Con Nginx como reverse proxy, la IP real del cliente viene en el
  // header X-Forwarded-For. "trust proxy = 1" le dice a Express que
  // confíe en un nivel de proxy y use ese header para req.ip.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN === '*'
      ? true
      : process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : true, // Refleja dinámicamente si es '*' o si está ausente
    credentials: true,
  });
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


  const config = new DocumentBuilder()
    .setTitle('JASRAPO API - Sistema de Gestión de Agua Potable')
    .setDescription(`
  ## 📋 Descripción
  API RESTful para el sistema de gestión de JASRAPO.

  ## 🔐 Autenticación
  Esta API utiliza **JWT (JSON Web Token)** para la autenticación.
  1. Obtén el token de acceso mediante el endpoint \`/auth/login\`\n
  2. Incluye el token en el header: \`Authorization: Bearer <tu-token>\`

  ## 📝 Notas
  - Todos los endpoints (excepto login) requieren autenticación
  - Los timestamps están en zona horaria de Ecuador (UTC-5)
    `)
    .setVersion('2.0')
    .setContact('Equipo JASRAPO', 'https://jasrapo.com', 'soporte@jasrapo.com')
    .setTermsOfService('https://jasrapo.com/terminos')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap();
