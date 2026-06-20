import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { PreInvoiceModule } from '../pre-invoice/pre-invoice.module';
import { BatchController } from './interfaces/http/batch.controller';
import { BatchService } from './application/batch.service';
import { BatchRepository } from './domain/repositories/batch.repository';
import { PrismaBatchRepository } from './infrastructure/repositories/prisma-batch.repository';
import { GenerateBatchUseCase } from './application/use-cases/generate-batch.use-case';
import { FindAllBatchesUseCase } from './application/use-cases/find-all-batches.use-case';
import { FindOneBatchUseCase } from './application/use-cases/find-one-batch.use-case';
import { SendBatchEmailsUseCase } from './application/use-cases/send-batch-emails.use-case';

@Module({
  imports: [DatabaseModule, PreInvoiceModule],
  controllers: [BatchController],
  providers: [
    { provide: BatchRepository, useClass: PrismaBatchRepository },
    GenerateBatchUseCase,
    FindAllBatchesUseCase,
    FindOneBatchUseCase,
    SendBatchEmailsUseCase,
    BatchService,
  ],
  exports: [BatchRepository, BatchService],
})
export class BatchModule {}
