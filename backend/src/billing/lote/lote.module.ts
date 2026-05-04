import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { LoteController } from './lote.controller';
import { LoteService } from './lote.service';

@Module({
  imports: [PrismaModule],
  controllers: [LoteController],
  providers: [LoteService],
  exports: [LoteService],
})
export class LoteModule {}
