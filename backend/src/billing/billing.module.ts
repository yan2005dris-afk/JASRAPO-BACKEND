import { Module } from '@nestjs/common';
import { CategoriaTarifaModule } from './tariffs/categoria-tarifa.module';
import { LoteModule } from './lote/lote.module';
import { ConveniosModule } from './collections/convenios/convenios.module';

@Module({
  imports: [CategoriaTarifaModule, LoteModule, ConveniosModule],
  exports: [CategoriaTarifaModule, LoteModule, ConveniosModule],
})
export class BillingModule {}
