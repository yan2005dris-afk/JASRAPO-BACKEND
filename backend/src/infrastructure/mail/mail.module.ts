import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProviderFactory } from './infrastructure/providers/provider.factory';
import { FailoverDispatcher } from './infrastructure/dispatchers/failover.dispatcher';
import { RoundRobinDispatcher } from './infrastructure/dispatchers/round-robin.dispatcher';
import { MailRateLimitService } from './infrastructure/rate-limit/mail-rate-limit.service';
import { MailService } from './application/mail.service';
import { MailQueueService } from './infrastructure/queue/mail-queue.service';
import { MailMetricsController } from './interfaces/http/mail-metrics.controller';
import { JobsModule } from '../jobs/jobs.module';
import { buildMailProviders } from './infrastructure/providers/build-mail-providers';
import type { MailDispatcher } from './domain/interfaces/mail-provider.interface';

/**
 * MailModule - Gestiona la infraestructura de envío de correos.
 * Usa un enfoque de colas transaccionales sobre PostgreSQL (pg-boss).
 */
@Global()
@Module({
  imports: [JobsModule],
  controllers: [MailMetricsController],
  providers: [
    MailRateLimitService,
    FailoverDispatcher,
    RoundRobinDispatcher,
    {
      provide: 'MAIL_DISPATCHER',
      useFactory: (
        configService: ConfigService,
        failover: FailoverDispatcher,
        roundRobin: RoundRobinDispatcher,
      ): MailDispatcher => {
        const providers = buildMailProviders(configService);
        const strategy = providers[0]?.strategy ?? 'failover';
        return strategy === 'round-robin' ? roundRobin : failover;
      },
      inject: [ConfigService, FailoverDispatcher, RoundRobinDispatcher],
    },
    MailProviderFactory,
    MailService,
    MailQueueService,
  ],
  exports: [
    MailService,
    MailQueueService,
    MailProviderFactory,
    FailoverDispatcher,
    RoundRobinDispatcher,
  ],
})
export class MailModule {}
