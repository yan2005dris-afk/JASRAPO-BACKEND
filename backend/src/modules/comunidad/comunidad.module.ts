import { Module } from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { ComunidadController } from './comunidad.controller';

@Module({
  controllers: [ComunidadController],
  providers: [ComunidadService],
})
export class ComunidadModule {}
