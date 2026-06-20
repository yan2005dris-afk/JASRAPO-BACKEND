import { Module } from '@nestjs/common';
import { EmisoresController } from './interfaces/http/emisores.controller';
import { EmisoresService } from './application/emisores.service';
import { EmisorRepository } from './domain/repositories/emisor.repository';
import { PrismaEmisorRepository } from './infrastructure/repositories/prisma-emisor.repository';

@Module({
  controllers: [EmisoresController],
  providers: [
    EmisoresService,
    {
      provide: EmisorRepository,
      useClass: PrismaEmisorRepository,
    },
  ],
  exports: [EmisoresService, EmisorRepository],
})
export class EmisoresModule {}
