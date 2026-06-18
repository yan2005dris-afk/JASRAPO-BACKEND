import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './identity/identity.module';
import { DatabaseModule } from './infrastructure/database/prisma.module';
import { MeteringModule } from './metering/metering.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { BillingModule } from './billing/billing.module';
import { OperationsModule } from './operations/operations.module';
import { PublicPortalModule } from './public-portal/public-portal.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';
import { SriIntegrationModule } from './sri/sri.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { JobsModule } from './infrastructure/jobs/jobs.module';
import { EncryptionModule } from './infrastructure/encryption/encryption.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { PdfModule } from './infrastructure/pdf/pdf.module';
import { ReportsModule } from './reports/reports.module';
import { StorageProxyModule } from './infrastructure/storage-proxy/storage-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // Motor de trabajos asíncronos basado en PostgreSQL
    JobsModule,

    // Encriptación Global
    EncryptionModule,

    // Auditoría Global
    AuditModule,

    // Limitar peticiones
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),

    ObservabilityModule,
    DatabaseModule,
    IdentityModule,
    MeteringModule,
    BillingModule,
    OperationsModule,
    PublicPortalModule,
    StorageModule,
    SriIntegrationModule,
    MailModule,
    PdfModule,
    ReportsModule,
    StorageProxyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
