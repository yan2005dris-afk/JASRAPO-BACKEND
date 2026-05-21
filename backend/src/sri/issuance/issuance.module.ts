import { Module } from '@nestjs/common';
import {
  FacturaService,
  NotaCreditoService,
  NotaDebitoService,
  RetencionService,
  SriRepositoryService,
} from './services';

@Module({
  providers: [
    FacturaService,
    NotaCreditoService,
    NotaDebitoService,
    RetencionService,
    SriRepositoryService,
  ],
  exports: [
    FacturaService,
    NotaCreditoService,
    NotaDebitoService,
    RetencionService,
    SriRepositoryService,
  ],
})
export class IssuanceModule {}
