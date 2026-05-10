import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';

@Module({
  controllers: [RoutesController],
  providers: [
    RoutesService,
    GetEligibleReadingsUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
  ],
  exports: [
    GetEligibleReadingsUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
  ],
})
export class RoutesModule {}
