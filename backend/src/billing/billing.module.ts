import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { BatchModule } from './batch/batch.module';
import { AgreementsModule } from './collections/agreements/agreements.module';
import { PreInvoiceModule } from './pre-invoice/pre-invoice.module';

@Module({
  imports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
  ],
  exports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
  ],
})
export class BillingModule {}
