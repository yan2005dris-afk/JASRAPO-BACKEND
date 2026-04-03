import { Module } from '@nestjs/common';
import { MedidoresService } from './medidor.service';
import { MedidoresController } from './medidor.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [MedidoresController],
  providers: [MedidoresService, PrismaService],
  exports: [MedidoresService],
})
export class MedidoresModule {}