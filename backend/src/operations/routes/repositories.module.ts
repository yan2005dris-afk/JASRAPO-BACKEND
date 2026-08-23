import { Module } from '@nestjs/common';
import { RouteRepository } from './domain/repositories/route.repository';
import { PrismaRouteRepository } from './infrastructure/repositories/prisma-route.repository';
import { OrdenTrabajoRepository } from './domain/repositories/orden-trabajo.repository';
import { PrismaOrdenTrabajoRepository } from './infrastructure/repositories/prisma-orden-trabajo.repository';

@Module({
  providers: [
    { provide: RouteRepository, useClass: PrismaRouteRepository },
    { provide: OrdenTrabajoRepository, useClass: PrismaOrdenTrabajoRepository },
  ],
  exports: [RouteRepository, OrdenTrabajoRepository],
})
export class RepositoriesModule {}
