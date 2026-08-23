import { Module } from '@nestjs/common';
import { CashSessionsController } from './interfaces/http/cash-sessions.controller';
import { PrismaCashSessionRepository } from './infrastructure/repositories/prisma-cash-session.repository';

@Module({
  controllers: [CashSessionsController],
  providers: [PrismaCashSessionRepository],
  exports: [PrismaCashSessionRepository],
})
export class CashSessionsModule {}
