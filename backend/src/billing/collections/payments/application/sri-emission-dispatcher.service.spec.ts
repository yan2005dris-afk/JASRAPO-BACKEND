import { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';
import type { PaymentRepository } from '../domain/repositories/payment.repository';
import type { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import type { JobService } from '../domain/interfaces/job-service.interface';
import type { SriEmisionModeService } from 'src/sri/emision/application/services/sri-emision-mode.service';
import type { AuditService } from 'src/infrastructure/audit/audit.service';

describe('SRIEmissionDispatcherService', () => {
  let service: SRIEmissionDispatcherService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let jobsService: jest.Mocked<JobService>;
  let sriEmisionModeService: jest.Mocked<
    Pick<SriEmisionModeService, 'getMode'>
  >;
  let auditService: jest.Mocked<Pick<AuditService, 'log'>>;

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
    sriEmisionModeService = {
      getMode: jest.fn().mockResolvedValue('automatico'),
    };
    auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    service = new SRIEmissionDispatcherService(
      paymentRepository,
      comprobanteRepository,
      jobsService,
      sriEmisionModeService as unknown as SriEmisionModeService,
      auditService as unknown as AuditService,
    );
  });

  it('EMITTED: locks BORRADOR → ENVIANDO and enqueues sri-emision job (auto mode)', async () => {
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
      origen: 'auto',
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

  // ─── R-4: Manual mode branching (sdd/sri-emision-modo-manual-automatico) ─

  describe('tryEmit — manual mode (R-4/S2)', () => {
    it('manual + BORRADOR → parks at POR_EMITIR, NO send, returns QUEUED_FOR_MANUAL, audits parqueado-manual', async () => {
      sriEmisionModeService.getMode.mockResolvedValue('manual');
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.BORRADOR,
      } as any);
      comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);

      const outcome = await service.tryEmit(42n);

      expect(outcome).toBe('QUEUED_FOR_MANUAL');
      expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
        42n,
        ComprobanteEstado.BORRADOR,
        ComprobanteEstado.POR_EMITIR,
      );
      expect(jobsService.send).not.toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          accion: 'parqueado-manual',
          recurso: 'comprobante',
          recursoId: '42',
          metadata: expect.objectContaining({
            comprobanteId: '42',
            previousState: ComprobanteEstado.BORRADOR,
            newState: ComprobanteEstado.POR_EMITIR,
          }),
        }),
      );
    });

    it('manual + BORRADOR + LOCK_LOST → returns LOCK_LOST, NO audit, NO send', async () => {
      sriEmisionModeService.getMode.mockResolvedValue('manual');
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.BORRADOR,
      } as any);
      comprobanteRepository.updateEstadoWithLock.mockResolvedValue(false);

      const outcome = await service.tryEmit(42n);

      expect(outcome).toBe('LOCK_LOST');
      expect(jobsService.send).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('manual + non-BORRADOR estado → returns ALREADY_EMITTED, no lock, no audit', async () => {
      sriEmisionModeService.getMode.mockResolvedValue('manual');
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.AUTORIZADO,
      } as any);

      const outcome = await service.tryEmit(42n);

      expect(outcome).toBe('ALREADY_EMITTED');
      expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
      expect(jobsService.send).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });

  // ─── tryEmitManual: operator-triggered emission from POR_EMITIR or BORRADOR ─

  describe('tryEmitManual (R-4/S3, S4, S5)', () => {
    it('S3: BORRADOR → locks to ENVIANDO + sends sri-emision job with origen="manual" → EMITTED', async () => {
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.BORRADOR,
      } as any);
      comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);
      jobsService.send.mockResolvedValue('job-1');

      const outcome = await service.tryEmitManual(42n);

      expect(outcome).toBe('EMITTED');
      expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
        42n,
        ComprobanteEstado.BORRADOR,
        ComprobanteEstado.ENVIANDO,
      );
      expect(jobsService.send).toHaveBeenCalledWith(SRI_EMISION_JOB, {
        tipo: 'FACTURA_DESDE_PREFACTURA',
        comprobanteId: 42n,
        origen: 'manual',
      });
    });

    it('S4: POR_EMITIR → locks to ENVIANDO + sends job with origen="manual" → EMITTED', async () => {
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.POR_EMITIR,
      } as any);
      comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);
      jobsService.send.mockResolvedValue('job-1');

      const outcome = await service.tryEmitManual(42n);

      expect(outcome).toBe('EMITTED');
      expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
        42n,
        ComprobanteEstado.POR_EMITIR,
        ComprobanteEstado.ENVIANDO,
      );
      expect(jobsService.send).toHaveBeenCalledWith(SRI_EMISION_JOB, {
        tipo: 'FACTURA_DESDE_PREFACTURA',
        comprobanteId: 42n,
        origen: 'manual',
      });
    });

    it('S5: AUTORIZADO → returns INVALID_STATE, no lock, no send', async () => {
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.AUTORIZADO,
      } as any);

      const outcome = await service.tryEmitManual(42n);

      expect(outcome).toBe('INVALID_STATE');
      expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
      expect(jobsService.send).not.toHaveBeenCalled();
    });

    it('NOT_FOUND: returns NOT_FOUND when comprobante does not exist', async () => {
      paymentRepository.findUniqueComprobante.mockResolvedValue(null);

      const outcome = await service.tryEmitManual(99n);

      expect(outcome).toBe('NOT_FOUND');
      expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
      expect(jobsService.send).not.toHaveBeenCalled();
    });

    it('R-A.1: rejects when send fails and reverts estado to BORRADOR (manual path)', async () => {
      const sendError = new Error('pgboss-queue-down');
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.POR_EMITIR,
      } as any);
      comprobanteRepository.updateEstadoWithLock
        .mockResolvedValueOnce(true) // POR_EMITIR → ENVIANDO
        .mockResolvedValueOnce(true); // revert: ENVIANDO → POR_EMITIR
      jobsService.send.mockRejectedValue(sendError);

      await expect(service.tryEmitManual(42n)).rejects.toThrow(sendError);

      expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledTimes(
        2,
      );
      expect(
        comprobanteRepository.updateEstadoWithLock,
      ).toHaveBeenNthCalledWith(
        2,
        42n,
        ComprobanteEstado.ENVIANDO,
        ComprobanteEstado.POR_EMITIR,
      );
    });

    it('rejects when send fails and reverts estado to BORRADOR (manual path, BORRADOR origin)', async () => {
      const sendError = new Error('pgboss-queue-down');
      paymentRepository.findUniqueComprobante.mockResolvedValue({
        id: 42n,
        importeTotal: 100,
        estado: ComprobanteEstado.BORRADOR,
      } as any);
      comprobanteRepository.updateEstadoWithLock
        .mockResolvedValueOnce(true) // BORRADOR → ENVIANDO
        .mockResolvedValueOnce(true); // revert: ENVIANDO → BORRADOR
      jobsService.send.mockRejectedValue(sendError);

      await expect(service.tryEmitManual(42n)).rejects.toThrow(sendError);

      expect(
        comprobanteRepository.updateEstadoWithLock,
      ).toHaveBeenNthCalledWith(
        2,
        42n,
        ComprobanteEstado.ENVIANDO,
        ComprobanteEstado.BORRADOR,
      );
    });
  });
});
