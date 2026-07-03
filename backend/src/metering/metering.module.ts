import { Module } from '@nestjs/common';
import { ReadingModule } from './readings/reading.module';
import { MeterModule } from './meters/meter.module';
import { OperatorModule } from './operator/operator.module';

@Module({
  imports: [ReadingModule, MeterModule, OperatorModule],
  exports: [ReadingModule, MeterModule],
})
export class MeteringModule {}
