import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { PreInvoiceController } from './interfaces/http/pre-invoice.controller';
import { PreInvoiceService } from './application/pre-invoice.service';
import { PreInvoiceRepository } from './domain/repositories/pre-invoice.repository';
import { PrismaPreInvoiceRepository } from './infrastructure/repositories/prisma-pre-invoice.repository';
import { FindAllPreInvoicesUseCase } from './application/use-cases/find-all-pre-invoices.use-case';
import { FindOnePreInvoiceUseCase } from './application/use-cases/find-one-pre-invoice.use-case';
import { UpdatePreInvoiceStateUseCase } from './application/use-cases/update-pre-invoice-state.use-case';
import { GeneratePreInvoicePdfUseCase } from './application/use-cases/generate-pre-invoice-pdf.use-case';
import { SendPreInvoiceByEmailUseCase } from './application/use-cases/send-pre-invoice-by-email.use-case';
import { SendBatchPreInvoicesByEmailUseCase } from './application/use-cases/send-batch-pre-invoices-by-email.use-case';
import { PreInvoicePdfDocumentType } from './pdf/pre-invoice.pdf-type';

@Module({
  imports: [DatabaseModule],
  controllers: [PreInvoiceController],
  providers: [
    { provide: PreInvoiceRepository, useClass: PrismaPreInvoiceRepository },
    FindAllPreInvoicesUseCase,
    FindOnePreInvoiceUseCase,
    UpdatePreInvoiceStateUseCase,
    GeneratePreInvoicePdfUseCase,
    SendPreInvoiceByEmailUseCase,
    SendBatchPreInvoicesByEmailUseCase,
    PreInvoiceService,
  ],
  exports: [
    PreInvoiceRepository,
    PreInvoiceService,
    GeneratePreInvoicePdfUseCase,
    SendPreInvoiceByEmailUseCase,
    SendBatchPreInvoicesByEmailUseCase,
  ],
})
export class PreInvoiceModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(PreInvoicePdfDocumentType);
  }
}
