import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { BatchModule } from './batch/batch.module';
import { AgreementsModule } from './collections/agreements/agreements.module';
import { PreInvoiceModule } from './pre-invoice/pre-invoice.module';
import { PaymentsModule } from './collections/payments/payments.module';
import { DiscountsModule } from './discounts/discounts.module';
import { PeriodsModule } from './periods/periods.module';
import { RubrosModule } from './rubros/rubros.module';

@Module({
  imports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    PaymentsModule,
    DiscountsModule,
    PeriodsModule,
    RubrosModule,
  ],
  exports: [
    CategoriaTarifaModule,
    BatchModule,
    AgreementsModule,
    PreInvoiceModule,
    PaymentsModule,
    DiscountsModule,
    PeriodsModule,
    RubrosModule,
  ],
})
export class BillingModule {}

