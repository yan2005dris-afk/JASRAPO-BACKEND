import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { LoteModule } from './lote/lote.module';
import { AgreementsModule } from './collections/agreements/agreements.module';

@Module({
  imports: [CategoriaTarifaModule, LoteModule, AgreementsModule],
  exports: [CategoriaTarifaModule, LoteModule, AgreementsModule],
})
export class BillingModule {}
