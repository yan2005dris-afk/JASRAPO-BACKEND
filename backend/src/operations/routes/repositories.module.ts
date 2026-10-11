import { Module } from '@nestjs/common';
import { RouteRepository } from './domain/repositories/route.repository';
import { PrismaRouteRepository } from './infrastructure/repositories/prisma-route.repository';

@Module({
  providers: [
    { provide: RouteRepository, useClass: PrismaRouteRepository },
  ],
  exports: [RouteRepository],
})
export class RepositoriesModule {}
