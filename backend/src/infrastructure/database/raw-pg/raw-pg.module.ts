import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RawPgService } from './raw-pg.service';

/**
 * RawPgModule - Provee acceso de bajo nivel a PostgreSQL para casos de alto rendimiento
 * o SQL complejo que Prisma no maneja eficientemente.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RawPgService],
  exports: [RawPgService],
})
export class RawPgModule {}
