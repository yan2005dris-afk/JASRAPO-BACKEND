import { Module } from '@nestjs/common';
import { WebhooksController } from './interfaces/http/webhooks.controller';
import { WebhooksService } from './application/webhooks.service';
import { WebhookProcessor } from './infrastructure/queue/processors/webhook.processor';
import { WebhookRepository } from './domain/repositories/webhook.repository';
import { PrismaWebhookRepository } from './infrastructure/repositories/prisma-webhook.repository';

@Module({
  controllers: [WebhooksController],
  providers: [
    WebhooksService,
    WebhookProcessor,
    {
      provide: WebhookRepository,
      useClass: PrismaWebhookRepository,
    },
  ],
  exports: [WebhooksService, WebhookRepository],
})
export class WebhooksModule {}
