import { Module } from '@nestjs/common';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { BusquedaPublicaController } from './busqueda-publica.controller';

@Module({
  controllers: [BusquedaPublicaController],
  providers: [BusquedaPublicaService],
})
export class BusquedaPublicaModule {}
