import { Module } from '@nestjs/common';
import { BusquedaPublicaService } from './application/busqueda-publica.service';
import { BusquedaPublicaController } from './interfaces/http/busqueda-publica.controller';
import { PublicSearchUseCase } from './application/use-cases/public-search.use-case';
import { BusquedaPublicaRepository } from './domain/repositories/busqueda-publica.repository';
import { PrismaBusquedaPublicaRepository } from './infrastructure/repositories/prisma-busqueda-publica.repository';

@Module({
  controllers: [BusquedaPublicaController],
  providers: [
    {
      provide: BusquedaPublicaRepository,
      useClass: PrismaBusquedaPublicaRepository,
    },
    BusquedaPublicaService,
    PublicSearchUseCase,
  ],
  exports: [BusquedaPublicaRepository, PublicSearchUseCase],
})
export class BusquedaPublicaModule {}
