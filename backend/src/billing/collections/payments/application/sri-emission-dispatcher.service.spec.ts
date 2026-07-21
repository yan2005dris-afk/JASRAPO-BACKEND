import { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';
import type { PaymentRepository } from '../domain/repositories/payment.repository';
import type { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import type { JobService } from './pago-validado.handler';

describe('SRIEmissionDispatcherService', () => {
  let service: SRIEmissionDispatcherService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let jobsService: jest.Mocked<JobService>;

  beforeEach(() => {
    paymentRepository = {
      findUniqueComprobante: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;
    comprobanteRepository = {
      updateEstadoWithLock: jest.fn(),
    } as unknown as jest.Mocked<ComprobanteRepository>;
    jobsService = {
      send: jest.fn(),
    };

    service = new SRIEmissionDispatcherService(
      paymentRepository,
      comprobanteRepository,
      jobsService,
    );
  });

  it('EMITTED: locks BORRADOR → ENVIANDO and enqueues sri-emision job', async () => {
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: 42n,
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    } as any);
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);
    jobsService.send.mockResolvedValue('job-1');

    const outcome = await service.tryEmit(42n);

    expect(outcome).toBe('EMITTED');
    expect(paymentRepository.findUniqueComprobante).toHaveBeenCalledWith({
      id: 42n,
    });
    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
      42n,
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.ENVIANDO,
    );
    expect(jobsService.send).toHaveBeenCalledWith(SRI_EMISION_JOB, {
      tipo: 'FACTURA_DESDE_PREFACTURA',
      comprobanteId: 42n,
    });
  });

  it('NOT_FOUND: returns NOT_FOUND when comprobante does not exist', async () => {
    paymentRepository.findUniqueComprobante.mockResolvedValue(null);

    const outcome = await service.tryEmit(99n);

    expect(outcome).toBe('NOT_FOUND');
    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('ALREADY_EMITTED: returns ALREADY_EMITTED when estado !== BORRADOR', async () => {
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: 42n,
      importeTotal: 100,
      estado: ComprobanteEstado.AUTORIZADO,
    } as any);

    const outcome = await service.tryEmit(42n);

    expect(outcome).toBe('ALREADY_EMITTED');
    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('LOCK_LOST: returns LOCK_LOST when optimistic lock fails', async () => {
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: 42n,
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    } as any);
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(false);

    const outcome = await service.tryEmit(42n);

    expect(outcome).toBe('LOCK_LOST');
    expect(jobsService.send).not.toHaveBeenCalled();
  });
});
