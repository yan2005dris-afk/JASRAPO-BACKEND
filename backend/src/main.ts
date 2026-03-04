import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';

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

  app.useGlobalInterceptors(new BigIntInterceptor());

  const config = new DocumentBuilder()
    .setTitle('JASRAPO API')
    .setDescription('Documentación de la API de JASRAPO')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap();
