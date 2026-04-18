import { Module } from '@nestjs/common';
import { ContratoMedidorService } from './contrato-medidor.service';
import { ContratoMedidorController } from './contrato-medidor.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [ContratoMedidorController],
  providers: [ContratoMedidorService, PrismaService],
  exports: [ContratoMedidorService],
})
export class ContratoMedidorModule {}
