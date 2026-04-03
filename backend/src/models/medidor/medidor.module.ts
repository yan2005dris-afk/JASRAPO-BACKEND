import { Module } from '@nestjs/common';
import { MedidorService } from './medidor.service';
import { MedidorController } from './medidor.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [MedidorController],
  providers: [MedidorService, PrismaService],
  exports: [MedidorService],
})
export class MedidorModule {}