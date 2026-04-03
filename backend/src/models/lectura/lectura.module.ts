import { Module } from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { LecturaController } from './lectura.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [LecturaController],
  providers: [LecturaService, PrismaService],
  exports: [LecturaService],
})
export class LecturaModule {}