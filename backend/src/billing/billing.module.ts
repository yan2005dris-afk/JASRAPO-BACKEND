import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';

@Module({
  imports: [CategoriaTarifaModule],
  exports: [CategoriaTarifaModule],
})
export class BillingModule {}
