import { Module } from '@nestjs/common';
import { RoutesService } from './application/services/routes.service';
import { RoutesController } from './interfaces/http/routes.controller';
import { GetEligibleReadingsUseCase } from './application/use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './application/use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { RouteRepository } from './domain/repositories/route.repository';
import { PrismaRouteRepository } from './infrastructure/repositories/prisma-route.repository';

@Module({
  controllers: [RoutesController],
  providers: [
    { provide: RouteRepository, useClass: PrismaRouteRepository },
    RoutesService,
    GetEligibleReadingsUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
  ],
  exports: [
    RouteRepository,
    GetEligibleReadingsUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
  ],
})
export class RoutesModule {}
