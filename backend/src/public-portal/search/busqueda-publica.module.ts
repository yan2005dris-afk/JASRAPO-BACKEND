import { Module } from '@nestjs/common';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { PublicSearchUseCase } from './use-cases/public-search.use-case';

@Module({
  controllers: [BusquedaPublicaController],
  providers: [
    BusquedaPublicaService,
    PublicSearchUseCase,
  ],
  exports: [
    PublicSearchUseCase,
  ],
})
export class BusquedaPublicaModule {}
