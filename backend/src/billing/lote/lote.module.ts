import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { LoteController } from './lote.controller';
import { LoteService } from './lote.service';

@Module({
  imports: [DatabaseModule],
  controllers: [LoteController],
  providers: [LoteService],
  exports: [LoteService],
})
export class LoteModule {}
