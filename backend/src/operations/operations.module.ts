import { Module } from '@nestjs/common';
import { ContratoMedidorModule } from './contracts/contrato-medidor.module';
import { ComunidadModule } from './communities/comunidad.module';
import { SectorModule } from './sectors/sector.module';
import { ClientModule } from './clients/client.module';
import { RoutesModule } from './routes/routes.module';
import { WorkOrderNoveltiesModule } from './work-order-novelties/work-order-novelties.module';
import { OperatorModule } from './operator/operator.module';

@Module({
  imports: [
    ClientModule,
    ContratoMedidorModule,
    ComunidadModule,
    SectorModule,
    RoutesModule,
    WorkOrderNoveltiesModule,
    OperatorModule,
  ],
  exports: [
    ClientModule,
    ContratoMedidorModule,
    ComunidadModule,
    SectorModule,
    RoutesModule,
    WorkOrderNoveltiesModule,
    OperatorModule,
  ],
})
export class OperationsModule {}
