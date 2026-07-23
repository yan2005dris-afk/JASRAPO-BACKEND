import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentsController } from './interfaces/http/payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymentRepository } from './domain/repositories/payment.repository';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { PrefacturaService } from './domain/services/prefactura.service';
import { PrismaPrefacturaService } from './infrastructure/services/prisma-prefactura.service';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './application/use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './application/use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './application/use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './application/use-cases/apply-saldo-favor.use-case';
import { PagoValidadoHandler } from './application/pago-validado.handler';
import { CuotaPagadaHandler } from './application/cuota-pagada.handler';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import { OutboxModule } from 'src/shared/outbox/outbox.module';
import { OutboxProcessor } from 'src/shared/outbox/application/outbox.processor';

@Module({
  imports: [OutboxModule],
  controllers: [PaymentsController],
  providers: [
    { provide: PaymentRepository, useClass: PrismaPaymentRepository },
    { provide: PrefacturaService, useClass: PrismaPrefacturaService },
    PaymentsService,
    CreatePaymentUseCase,
    FindOnePaymentUseCase,
    ValidatePaymentUseCase,
    AnnulPaymentUseCase,
    ApplySaldoFavorUseCase,
    PagoValidadoHandler,
    CuotaPagadaHandler,
    { provide: 'JobService', useExisting: JobsService },
  ],
  exports: [PaymentRepository, PaymentsService],
})
export class PaymentsModule implements OnModuleInit {
  constructor(
    private readonly outboxProcessor: OutboxProcessor,
    private readonly pagoValidadoHandler: PagoValidadoHandler,
    private readonly cuotaPagadaHandler: CuotaPagadaHandler,
  ) {}

  onModuleInit(): void {
    // W-3: route pago.validado outbox rows through the existing handler so
    // comprobante emission remains eventually consistent on a process crash.
    this.outboxProcessor.registerHandler('pago.validado', async (evento) => {
      const pagoId = BigInt(evento.payload['pagoId'] as string);
      await this.pagoValidadoHandler.procesarPagoValidado(pagoId);
    });

    // G2: route cuota.pagada outbox rows — when the last cuota of a
    // prefactura is paid, trigger SRI emission via the dispatcher.
    this.outboxProcessor.registerHandler('cuota.pagada', async (evento) => {
      const cuotaConvenioId = BigInt(
        evento.payload['cuotaConvenioId'] as string,
      );
      await this.cuotaPagadaHandler.procesarCuotaPagada(cuotaConvenioId);
    });
  }
}
