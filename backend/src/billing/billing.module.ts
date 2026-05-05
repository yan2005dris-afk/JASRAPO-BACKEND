import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { LoteModule } from './lote/lote.module';

@Module({
  imports: [CategoriaTarifaModule, LoteModule],
  exports: [CategoriaTarifaModule, LoteModule],
})
export class BillingModule {}
