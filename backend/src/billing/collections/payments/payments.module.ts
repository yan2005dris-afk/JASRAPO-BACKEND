import { Module } from '@nestjs/common';
import { PaymentsController } from './interfaces/http/payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymentRepository } from './domain/repositories/payment.repository';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './application/use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './application/use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './application/use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './application/use-cases/apply-saldo-favor.use-case';
import { PagoValidadoHandler } from './application/pago-validado.handler';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    { provide: PaymentRepository, useClass: PrismaPaymentRepository },
    PaymentsService,
    CreatePaymentUseCase,
    FindOnePaymentUseCase,
    ValidatePaymentUseCase,
    AnnulPaymentUseCase,
    ApplySaldoFavorUseCase,
    PagoValidadoHandler,
    { provide: 'JobService', useExisting: JobsService },
  ],
  exports: [PaymentRepository, PaymentsService],
})
export class PaymentsModule {}
