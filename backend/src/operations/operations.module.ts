import { Module } from '@nestjs/common';
import { ClientModule } from './customers/client.module';
import { ContratoMedidorModule } from './contracts/contrato-medidor.module';
import { NovedadOperativaModule } from './field-work/novedad-operativa.module';
import { ComunidadModule } from './territory/communities/comunidad.module';
import { SectorModule } from './territory/sectors/sector.module';

@Module({
  imports: [
    ClientModule,
    ContratoMedidorModule,
    NovedadOperativaModule,
    ComunidadModule,
    SectorModule,
  ],
  exports: [
    ClientModule,
    ContratoMedidorModule,
    NovedadOperativaModule,
    ComunidadModule,
    SectorModule,
  ],
})
export class OperationsModule {}
