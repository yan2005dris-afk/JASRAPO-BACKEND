import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EventosPendientesRepository } from './domain/repositories/eventos-pendientes.repository';
import { PrismaEventosPendientesRepository } from './infrastructure/persistence/prisma-eventos-pendientes.repository';
import { OutboxProcessor } from './application/outbox.processor';

@Module({
  providers: [
    PrismaService,
    PrismaEventosPendientesRepository,
    {
      provide: EventosPendientesRepository,
      useExisting: PrismaEventosPendientesRepository,
    },
    OutboxProcessor,
  ],
  exports: [EventosPendientesRepository, OutboxProcessor],
})
export class OutboxModule {}
