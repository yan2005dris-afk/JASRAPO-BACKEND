import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/prisma.module';
import { SistemaConfigRepository } from './sistema-config.repository';
import { SistemaConfigService } from './sistema-config.service';

/**
 * SistemaConfigModule — global access to the `sistema_config` key/value
 * table with a 60s in-memory cache.
 *
 * Marked `@Global()` so any feature module (e.g. `ReportsModule`) can
 * inject `SistemaConfigService` without re-importing this module. This
 * mirrors the existing `PdfModule` and `AuditModule` patterns and is
 * appropriate because the keyspace is a project-wide singleton.
 *
 * Wires:
 *   - `SistemaConfigRepository` (Prisma wrapper) as a private provider.
 *   - `SistemaConfigService` (cached lookup) as the exported public
 *     surface, along with the repository in case any consumer needs
 *     direct access to the underlying `findByClave` for tests.
 */
@Global()
@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [SistemaConfigRepository, SistemaConfigService],
  exports: [SistemaConfigService, SistemaConfigRepository],
})
export class SistemaConfigModule {}
