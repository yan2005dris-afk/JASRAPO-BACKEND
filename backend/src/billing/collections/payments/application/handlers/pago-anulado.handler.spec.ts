import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PagoAnuladoHandler } from './pago-anulado.handler';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { ComprobanteRepository } from '../../../../../sri/emision/domain/repositories/comprobante.repository';
import { EmitirNotaCreditoUseCase } from '../../../../../sri/emision/application/use-cases/emitir-nota-credito.use-case';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('PagoAnuladoHandler', () => {
  let handler: PagoAnuladoHandler;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let emitirNotaCreditoUseCase: jest.Mocked<EmitirNotaCreditoUseCase>;

  beforeEach(async () => {
    const mockPaymentRepo = {
      findPaymentDetailsByPagoId: jest.fn(),
    };

    const mockComprobanteRepo = {
      findRecordById: jest.fn(),
    };

    const mockEmitirNotaCredito = {
      emitirNotaCredito: jest.fn().mockResolvedValue({}),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagoAnuladoHandler,
        { provide: PaymentRepository, useValue: mockPaymentRepo },
        { provide: ComprobanteRepository, useValue: mockComprobanteRepo },
        { provide: EmitirNotaCreditoUseCase, useValue: mockEmitirNotaCredito },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    handler = module.get<PagoAnuladoHandler>(PagoAnuladoHandler);
    paymentRepository = module.get(PaymentRepository);
    comprobanteRepository = module.get(ComprobanteRepository);
    emitirNotaCreditoUseCase = module.get(EmitirNotaCreditoUseCase);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should emit credit note when linked comprobante was AUTORIZADO', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      { comprobanteId: 100n } as any,
    ]);

    comprobanteRepository.findRecordById.mockResolvedValue({
      id: 100n,
      estado: 'AUTORIZADO',
      secuencial: '000000123',
      clave_acceso: '180820260109999999990011001001000000123123456781',
      fecha_emision: '18/08/2026',
      total_sin_impuestos: 25.5,
      receptor_identificacion: '0999999999001',
      receptor_razon_social: 'CONSUMIDOR FINAL',
    } as any);

    await handler.procesarPagoAnulado(1n, 'Error en cobro de ventanilla');

    expect(emitirNotaCreditoUseCase.emitirNotaCredito).toHaveBeenCalledWith(
      expect.objectContaining({
        codDocModificado: '01',
        numDocModificado: '001-001-000000123',
        motivo: 'Error en cobro de ventanilla',
      }),
    );
  });

  it('should skip credit note when comprobante was NOT authorized', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      { comprobanteId: 100n } as any,
    ]);

    comprobanteRepository.findRecordById.mockResolvedValue({
      id: 100n,
      estado: 'BORRADOR',
    } as any);

    await handler.procesarPagoAnulado(1n, 'Error');

    expect(emitirNotaCreditoUseCase.emitirNotaCredito).not.toHaveBeenCalled();
  });
});
