import { Module } from '@nestjs/common';
import { NovedadOperativaService } from './novedad-operativa.service';
import { NovedadOperativaController } from './novedad-operativa.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [NovedadOperativaController],
  providers: [NovedadOperativaService, PrismaService],
  exports: [NovedadOperativaService],
})
export class NovedadOperativaModule {}
