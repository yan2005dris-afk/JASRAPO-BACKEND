import { Module } from '@nestjs/common';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CategoriaTarifaController } from './categoria-tarifa.controller';

@Module({
  controllers: [CategoriaTarifaController],
  providers: [CategoriaTarifaService],
})
export class CategoriaTarifaModule {}
