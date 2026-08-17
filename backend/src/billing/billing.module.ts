import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { BatchModule } from './batch/batch.module';
import { AgreementsModule } from './collections/agreements/agreements.module';
import { PreInvoiceModule } from './pre-invoice/pre-invoice.module';
import { PaymentsModule } from './collections/payments/payments.module';
import { DiscountsModule } from './discounts/discounts.module';
import { PeriodsModule } from './periods/periods.module';

@Module({
  imports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    PaymentsModule,
    DiscountsModule,
    PeriodsModule,
  ],
  exports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    PaymentsModule,
    DiscountsModule,
    PeriodsModule,
  ],
})
export class BillingModule {}
