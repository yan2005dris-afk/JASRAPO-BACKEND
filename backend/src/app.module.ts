import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { JwtAuthGuard } from './identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from './infrastructure/common/guards/permissions.guard';
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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
