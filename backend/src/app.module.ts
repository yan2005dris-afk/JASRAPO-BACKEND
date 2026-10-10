import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { JwtAuthGuard } from './identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { ThrottlerExceptionFilter } from 'src/common/filters/throttler-exception.filter';
import { AuditFieldsInterceptor } from 'src/common/interceptors/audit-fields.interceptor';
import { BigIntInterceptor } from 'src/common/interceptors/bigint.interceptor';
import { DecimalToStringInterceptor } from 'src/common/interceptors/decimal-to-string.interceptor';
import { LoggingInterceptor } from './infrastructure/observability/interceptors/logging.interceptor';
import { IdentityModule } from './identity/identity.module';
import { MeteringModule } from './metering/metering.module';
import { BillingModule } from './billing/billing.module';
import { OperationsModule } from './operations/operations.module';
import { PublicPortalModule } from './public-portal/public-portal.module';
import { SriIntegrationModule } from './sri/sri.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Infraestructura y configuración global
    CoreModule,

    // Bounded Contexts / Módulos de Dominio de Negocio
    IdentityModule,
    MeteringModule,
    BillingModule,
    OperationsModule,
    PublicPortalModule,
    SriIntegrationModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },

    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditFieldsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BigIntInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DecimalToStringInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global Filters (ThrottlerExceptionFilter evaluated before GlobalExceptionFilter)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
export class AppModule {}
