import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentsController } from './interfaces/http/payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymentRepository } from './domain/repositories/payment.repository';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { PrefacturaQueryRepository } from './domain/repositories/prefactura-query.repository';
import { PrismaPrefacturaQueryRepository } from './infrastructure/repositories/prisma-prefactura-query.repository';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { CreateCobroPuntualUseCase } from './application/use-cases/create-cobro-puntual.use-case';
import { FindOnePaymentUseCase } from './application/use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './application/use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './application/use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './application/use-cases/apply-saldo-favor.use-case';
import { GetDailyCashSummaryUseCase } from './application/use-cases/get-daily-cash-summary.use-case';
import { PagoValidadoHandler } from './application/handlers/pago-validado.handler';
import { CuotaPagadaHandler } from './application/handlers/cuota-pagada.handler';
import { PagoAnuladoHandler } from './application/handlers/pago-anulado.handler';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import { OutboxModule } from 'src/shared/outbox/outbox.module';
import { OutboxProcessor } from 'src/shared/outbox/application/outbox.processor';
import { EmisionModule } from 'src/sri/emision/emision.module';

@Module({
  imports: [OutboxModule, EmisionModule],
  controllers: [PaymentsController],
  providers: [
    { provide: PaymentRepository, useClass: PrismaPaymentRepository },
    {
      provide: PrefacturaQueryRepository,
      useClass: PrismaPrefacturaQueryRepository,
    },
    PaymentsService,
    CreatePaymentUseCase,
    CreateCobroPuntualUseCase,
    FindOnePaymentUseCase,
    ValidatePaymentUseCase,
    AnnulPaymentUseCase,
    ApplySaldoFavorUseCase,
    GetDailyCashSummaryUseCase,
    PagoValidadoHandler,
    CuotaPagadaHandler,
    PagoAnuladoHandler,
    { provide: 'JobService', useExisting: JobsService },
  ],
  exports: [PaymentRepository, PaymentsService],
})
export class PaymentsModule implements OnModuleInit {
  constructor(
    private readonly outboxProcessor: OutboxProcessor,
    private readonly pagoValidadoHandler: PagoValidadoHandler,
    private readonly cuotaPagadaHandler: CuotaPagadaHandler,
    private readonly pagoAnuladoHandler: PagoAnuladoHandler,
  ) {}

  onModuleInit(): void {
    this.outboxProcessor.registerHandler('pago.validado', async (evento) => {
      const pagoId = BigInt(evento.payload['pagoId'] as string);
      await this.pagoValidadoHandler.procesarPagoValidado(pagoId);
    });

    this.outboxProcessor.registerHandler('cuota.pagada', async (evento) => {
      const cuotaConvenioId = BigInt(
        evento.payload['cuotaConvenioId'] as string,
      );
      await this.cuotaPagadaHandler.procesarCuotaPagada(cuotaConvenioId);
    });

    this.outboxProcessor.registerHandler('pago.anulado', async (evento) => {
      const pagoId = BigInt(evento.payload['pagoId'] as string);
      const motivo = (evento.payload['motivoAnulacion'] as string) || '';
      await this.pagoAnuladoHandler.procesarPagoAnulado(pagoId, motivo);
    });
  }
}
