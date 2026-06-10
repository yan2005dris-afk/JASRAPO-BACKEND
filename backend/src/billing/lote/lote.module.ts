import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { LoteController } from './interfaces/http/lote.controller';
import { LoteService } from './application/lote.service';
import { LoteRepository } from './domain/repositories/lote.repository';
import { PrismaLoteRepository } from './infrastructure/repositories/prisma-lote.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [LoteController],
  providers: [
    { provide: LoteRepository, useClass: PrismaLoteRepository },
    LoteService,
  ],
  exports: [LoteRepository, LoteService],
})
export class LoteModule {}
