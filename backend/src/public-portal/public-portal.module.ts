import { Module } from '@nestjs/common';
import { BusquedaPublicaModule } from './search/busqueda-publica.module';

@Module({
  imports: [BusquedaPublicaModule],
  exports: [BusquedaPublicaModule],
})
export class PublicPortalModule {}
