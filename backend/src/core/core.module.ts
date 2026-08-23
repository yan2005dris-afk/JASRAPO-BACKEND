import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '../infrastructure/database/prisma.module';
import { JobsModule } from '../infrastructure/jobs/jobs.module';
import { EncryptionModule } from '../infrastructure/encryption/encryption.module';
import { AuditModule } from '../infrastructure/audit/audit.module';
import { ObservabilityModule } from '../infrastructure/observability/observability.module';
import { StorageModule } from '../infrastructure/storage/storage.module';
import { StorageProxyModule } from '../infrastructure/storage-proxy/storage-proxy.module';
import { MailModule } from '../infrastructure/mail/mail.module';
import { PdfModule } from '../infrastructure/pdf/pdf.module';
import { SistemaConfigModule } from '../infrastructure/config/sistema-config.module';

/**
 * CoreModule centraliza y encapsula la infraestructura global y singleton de la aplicación.
 * Mantiene AppModule enfocado exclusivamente en la orquestación de módulos de dominio de negocio.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    DatabaseModule,
    JobsModule,
    EncryptionModule,
    AuditModule,
    ObservabilityModule,
    StorageModule,
    StorageProxyModule,
    MailModule,
    PdfModule,
    SistemaConfigModule,
  ],
  exports: [
    DatabaseModule,
    JobsModule,
    EncryptionModule,
    AuditModule,
    ObservabilityModule,
    StorageModule,
    StorageProxyModule,
    MailModule,
    PdfModule,
    SistemaConfigModule,
  ],
})
export class CoreModule {}
