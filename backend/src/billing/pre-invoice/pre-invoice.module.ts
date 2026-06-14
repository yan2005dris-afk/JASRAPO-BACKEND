import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { PreInvoiceController } from './interfaces/http/pre-invoice.controller';
import { PreInvoiceService } from './application/pre-invoice.service';
import { PreInvoiceRepository } from './domain/repositories/pre-invoice.repository';
import { PrismaPreInvoiceRepository } from './infrastructure/repositories/prisma-pre-invoice.repository';
import { FindAllPreInvoicesUseCase } from './application/use-cases/find-all-pre-invoices.use-case';
import { FindOnePreInvoiceUseCase } from './application/use-cases/find-one-pre-invoice.use-case';
import { UpdatePreInvoiceStateUseCase } from './application/use-cases/update-pre-invoice-state.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [PreInvoiceController],
  providers: [
    { provide: PreInvoiceRepository, useClass: PrismaPreInvoiceRepository },
    FindAllPreInvoicesUseCase,
    FindOnePreInvoiceUseCase,
    UpdatePreInvoiceStateUseCase,
    PreInvoiceService,
  ],
  exports: [PreInvoiceRepository, PreInvoiceService],
})
export class PreInvoiceModule {}
