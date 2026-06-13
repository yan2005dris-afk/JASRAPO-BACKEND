import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { LoteModule } from './lote/lote.module';
import { AgreementsModule } from './collections/agreements/agreements.module';
import { PrefacturaModule } from './prefactura/prefactura.module';

@Module({
  imports: [CategoriaTarifaModule, LoteModule, AgreementsModule, PrefacturaModule],
  exports: [CategoriaTarifaModule, LoteModule, AgreementsModule, PrefacturaModule],
})
export class BillingModule {}
