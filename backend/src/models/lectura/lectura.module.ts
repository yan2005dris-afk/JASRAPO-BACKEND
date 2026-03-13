import { Module } from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { LecturaController } from './lectura.controller';
import { DatabaseModule } from 'src/database/prisma.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LecturaController],
  providers: [LecturaService],
  exports: [LecturaService],
})
export class LecturaModule {}
