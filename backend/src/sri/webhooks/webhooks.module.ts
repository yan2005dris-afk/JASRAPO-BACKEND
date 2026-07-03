import { Module } from '@nestjs/common';
import { WebhooksController } from './interfaces/http/webhooks.controller';
import { WebhooksService } from './application/webhooks.service';
import { WebhookProcessor } from './infrastructure/queue/processors/webhook.processor';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
