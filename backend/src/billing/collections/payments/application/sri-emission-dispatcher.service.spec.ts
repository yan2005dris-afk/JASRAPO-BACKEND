import { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';
import type { PaymentRepository } from '../domain/repositories/payment.repository';
import type { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import type { JobService } from '../domain/interfaces/job-service.interface';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

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
      mockLogger,
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

  // ─── R-A.1: Rollback on enqueue failure ─────────────────────────────────

  it('R-A.1: rejects when jobsService.send() fails and reverts estado to BORRADOR', async () => {
    const sendError = new Error('pgboss-queue-down');
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: 42n,
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    } as any);
    comprobanteRepository.updateEstadoWithLock
      .mockResolvedValueOnce(true) // lock for ENVIANDO
      .mockResolvedValueOnce(true); // revert to BORRADOR
    jobsService.send.mockRejectedValue(sendError);

    await expect(service.tryEmit(42n)).rejects.toThrow(sendError);

    // Revert must be called with ENVIANDO → BORRADOR
    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledTimes(2);
    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenNthCalledWith(
      2,
      42n,
      ComprobanteEstado.ENVIANDO,
      ComprobanteEstado.BORRADOR,
    );
  });

  it('R-A.1: when both send AND revert fail, revert error is logged and original error propagates', async () => {
    const sendError = new Error('pgboss-down');
    const revertError = new Error('db-connection-lost');
    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);

    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: 42n,
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    } as any);
    comprobanteRepository.updateEstadoWithLock
      .mockResolvedValueOnce(true) // lock for ENVIANDO
      .mockRejectedValueOnce(revertError); // revert also fails
    jobsService.send.mockRejectedValue(sendError);

    await expect(service.tryEmit(42n)).rejects.toThrow(sendError);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Revert failed'),
      revertError,
    );
    loggerErrorSpy.mockRestore();
  });
});