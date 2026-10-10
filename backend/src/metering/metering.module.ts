import { Module } from '@nestjs/common';
import { ReadingModule } from './readings/reading.module';
import { MeterModule } from './meters/meter.module';

@Module({
  imports: [ReadingModule, MeterModule],
  exports: [ReadingModule, MeterModule],
})
export class MeteringModule {}
