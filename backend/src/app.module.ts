import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './identity/identity.module';
import { DatabaseModule } from './infrastructure/database/prisma.module';
import { MeteringModule } from './metering/metering.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { BillingModule } from './billing/billing.module';
import { OperationsModule } from './operations/operations.module';
import { PublicPortalModule } from './public-portal/public-portal.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
