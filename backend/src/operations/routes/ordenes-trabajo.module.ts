import { Module, forwardRef } from '@nestjs/common';
import { OrdenesTrabajoService } from './application/ordenes-trabajo.service';
import { OrdenesTrabajoController } from './interfaces/http/ordenes-trabajo.controller';
import { FindOrdenesByRutaUseCase } from './application/use-cases/find-ordenes-by-ruta.use-case';
import { UpdateOrdenEstadoUseCase } from './application/use-cases/update-orden-estado.use-case';
import { LinkLecturaUseCase } from './application/use-cases/link-lectura.use-case';
import { OrdenTrabajoRepository } from './domain/repositories/orden-trabajo.repository';
import { PrismaOrdenTrabajoRepository } from './infrastructure/repositories/prisma-orden-trabajo.repository';
import { RoutesModule } from './routes.module';

@Module({
  imports: [forwardRef(() => RoutesModule)],
  controllers: [OrdenesTrabajoController],
  providers: [
    { provide: OrdenTrabajoRepository, useClass: PrismaOrdenTrabajoRepository },
    OrdenesTrabajoService,
    FindOrdenesByRutaUseCase,
    UpdateOrdenEstadoUseCase,
    LinkLecturaUseCase,
  ],
  exports: [
    OrdenTrabajoRepository,
    OrdenesTrabajoService,
    FindOrdenesByRutaUseCase,
    UpdateOrdenEstadoUseCase,
    LinkLecturaUseCase,
  ],
})
export class OrdenesTrabajoModule {}
