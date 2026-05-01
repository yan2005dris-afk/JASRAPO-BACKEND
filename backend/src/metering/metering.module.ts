import { Module } from '@nestjs/common';
import { LecturaModule } from './readings/lectura.module';
import { MedidorModule } from './devices/medidor.module';

@Module({
  imports: [LecturaModule, MedidorModule],
  exports: [LecturaModule, MedidorModule],
})
export class MeteringModule {}
