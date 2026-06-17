import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '../database/prisma.module';
import { AuditService } from './audit.service';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

/**
 * AuditModule - Gestión de auditoría global para la aplicación.
 * Registra automáticamente operaciones mutantes (POST, PUT, DELETE).
 */
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
