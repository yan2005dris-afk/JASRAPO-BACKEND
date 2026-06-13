import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/prisma.module';
import { PrefacturaController } from './interfaces/http/prefactura.controller';
import { PrefacturaService } from './application/prefactura.service';
import { PrefacturaRepository } from './domain/repositories/prefactura.repository';
import { PrismaPrefacturaRepository } from './infrastructure/repositories/prisma-prefactura.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PrefacturaController],
  providers: [
    { provide: PrefacturaRepository, useClass: PrismaPrefacturaRepository },
    PrefacturaService,
  ],
  exports: [PrefacturaRepository, PrefacturaService],
})
export class PrefacturaModule {}
