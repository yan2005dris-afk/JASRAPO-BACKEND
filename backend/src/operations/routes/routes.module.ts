import { Module } from '@nestjs/common';
import { RoutesService } from './application/routes.service';
import { RoutesController } from './interfaces/http/routes.controller';
import { GetEligibleReadingsUseCase } from './application/use-cases/get-eligible-readings.use-case';
import { GetReadingsByRutaUseCase } from './application/use-cases/get-readings-by-ruta.use-case';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './application/use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { ReassignRouteUseCase } from './application/use-cases/reassign-route.use-case';
import { RepositoriesModule } from './repositories.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo.module';

@Module({
  imports: [RepositoriesModule, OrdenesTrabajoModule],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    GetEligibleReadingsUseCase,
    GetReadingsByRutaUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    ReassignRouteUseCase,
  ],
  exports: [
    RepositoriesModule,
    RoutesService,
    GetEligibleReadingsUseCase,
    GetReadingsByRutaUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    ReassignRouteUseCase,
    OrdenesTrabajoModule,
  ],
})
export class RoutesModule {}
