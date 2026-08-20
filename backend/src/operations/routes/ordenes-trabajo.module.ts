import { Module } from '@nestjs/common';
import { OrdenesTrabajoService } from './application/ordenes-trabajo.service';
import { OrdenesTrabajoController } from './interfaces/http/ordenes-trabajo.controller';
import { FindOrdenesByRutaUseCase } from './application/use-cases/find-ordenes-by-ruta.use-case';
import { UpdateOrdenEstadoUseCase } from './application/use-cases/update-orden-estado.use-case';
import { LinkLecturaUseCase } from './application/use-cases/link-lectura.use-case';
import { RepositoriesModule } from './repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [OrdenesTrabajoController],
  providers: [
    OrdenesTrabajoService,
    FindOrdenesByRutaUseCase,
    UpdateOrdenEstadoUseCase,
    LinkLecturaUseCase,
  ],
  exports: [
    OrdenesTrabajoService,
    FindOrdenesByRutaUseCase,
    UpdateOrdenEstadoUseCase,
    LinkLecturaUseCase,
  ],
})
export class OrdenesTrabajoModule {}
