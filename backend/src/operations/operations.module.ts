import { Module } from '@nestjs/common';
import { ContratoMedidorModule } from './contracts/contrato-medidor.module';
import { ComunidadModule } from './territory/communities/comunidad.module';
import { SectorModule } from './territory/sectors/sector.module';
import { ClientModule } from './clients/client.module';

@Module({
  imports: [ClientModule, ContratoMedidorModule, ComunidadModule, SectorModule],
  exports: [ClientModule, ContratoMedidorModule, ComunidadModule, SectorModule],
})
export class OperationsModule {}
