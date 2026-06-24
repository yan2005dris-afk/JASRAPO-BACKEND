import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { BatchModule } from './batch/batch.module';
import { AgreementsModule } from './collections/agreements/agreements.module';
import { PreInvoiceModule } from './pre-invoice/pre-invoice.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    DiscountsModule,
  ],
  exports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    DiscountsModule,
  ],
})
export class BillingModule {}
