import { Module, Global } from '@nestjs/common';
import { JobsService } from './jobs.service';

/**
 * JobsModule - Provee el motor de colas transaccionales basado en PostgreSQL (pg-boss).
 * Elimina la necesidad de Redis en la infraestructura base.
 */
@Global()
@Module({
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
