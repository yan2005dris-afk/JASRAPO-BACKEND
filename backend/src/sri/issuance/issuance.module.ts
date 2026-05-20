import { Module } from '@nestjs/common';
import {
  FacturaService,
  NotaCreditoService,
  NotaDebitoService,
  RetencionService,
  GuiaRemisionService,
  SriRepositoryService,
} from './services';

@Module({
  providers: [
    FacturaService,
    NotaCreditoService,
    NotaDebitoService,
    RetencionService,
    GuiaRemisionService,
    SriRepositoryService,
  ],
  exports: [
    FacturaService,
    NotaCreditoService,
    NotaDebitoService,
    RetencionService,
    GuiaRemisionService,
    SriRepositoryService,
  ],
})
export class IssuanceModule {}
