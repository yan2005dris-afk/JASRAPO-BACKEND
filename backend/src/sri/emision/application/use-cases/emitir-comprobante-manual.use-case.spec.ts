// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { EmitirComprobanteManualUseCase } from './emitir-comprobante-manual.use-case';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';
import type { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import type {
  SRIEmissionDispatcherService,
  EmissionOutcome,
} from '../services/sri-emission-dispatcher.service';
import type { AuditService } from '../../../../infrastructure/audit/audit.service';

/**
 * Use case `EmitirComprobanteManualUseCase` (sdd/sri-emision-modo-manual-automatico)
 *
 * Responsibilities:
 *   - Look up the comprobante by `claveAcceso`. EntityNotFoundException if missing.
 *   - Validate estado ∈ {BORRADOR, POR_EMITIR}. InvalidDomainOperationException otherwise.
 *   - Delegate emission to `sriDispatcher.tryEmitManual()`.
 *   - Write an audit row recording the operator action.
 */
describe('EmitirComprobanteManualUseCase', () => {
  let useCase: EmitirComprobanteManualUseCase;
  let comprobanteRepository: jest.Mocked<
    Pick<ComprobanteRepository, 'findByClaveAcceso'>
  >;
  let sriDispatcher: jest.Mocked<
    Pick<SRIEmissionDispatcherService, 'tryEmitManual'>
  >;
  let auditService: jest.Mocked<Pick<AuditService, 'log'>>;

  const CLAVE = '1234567890123456789012345678901234567890123456789';
  const COMP = {
    id: 42n,
    estado: ComprobanteEstado.POR_EMITIR,
    clave_acceso: CLAVE,
  };
  const CURRENT_USER = {
    id: 7,
    email: 'sri-admin@example.com',
    ip: '127.0.0.1',
    userAgent: 'jest-agent/1.0',
  };

  beforeEach(() => {
    comprobanteRepository = {
      findByClaveAcceso: jest.fn(),
    };
    sriDispatcher = {
      tryEmitManual: jest.fn(),
    };
    auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new EmitirComprobanteManualUseCase(
      comprobanteRepository as unknown as ComprobanteRepository,
      sriDispatcher as unknown as SRIEmissionDispatcherService,
      auditService as unknown as AuditService,
    );
  });

  it('R-6/S1: valid POR_EMITIR → optimistic lock succeeds → EMITTED + audit', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(COMP as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('EMITTED');

    const outcome = await useCase.execute(CLAVE, CURRENT_USER);

    expect(outcome).toBe('EMITTED');
    expect(sriDispatcher.tryEmitManual).toHaveBeenCalledWith(42n);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'emision-manual',
        usuarioId: 7,
        recurso: 'comprobante',
        recursoId: CLAVE,
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent/1.0',
        exitoso: true,
        metadata: expect.objectContaining({
          previousState: ComprobanteEstado.POR_EMITIR,
          outcome: 'EMITTED',
          comprobanteId: 42n,
        }),
      }),
    );
  });

  it('R-6/S2: valid BORRADOR → optimistic lock succeeds → EMITTED + audit', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue({
      ...COMP,
      estado: ComprobanteEstado.BORRADOR,
    } as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('EMITTED');

    const outcome = await useCase.execute(CLAVE, CURRENT_USER);

    expect(outcome).toBe('EMITTED');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'emision-manual',
        metadata: expect.objectContaining({
          previousState: ComprobanteEstado.BORRADOR,
        }),
      }),
    );
  });

  it('R-6/S3: INVALID_STATE from dispatcher → InvalidDomainOperationException + audit(exitoso:false)', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue({
      ...COMP,
      estado: ComprobanteEstado.AUTORIZADO,
    } as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('INVALID_STATE');

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      InvalidDomainOperationException,
    );
    expect(sriDispatcher.tryEmitManual).toHaveBeenCalledWith(42n);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        exitoso: false,
        metadata: expect.objectContaining({ outcome: 'INVALID_STATE' }),
      }),
    );
  });

  it('R-6/S4: unknown claveAcceso → EntityNotFoundException, no dispatcher call, no audit', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(null);

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      EntityNotFoundException,
    );
    expect(sriDispatcher.tryEmitManual).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('LOCK_LOST from dispatcher → InvalidDomainOperationException + audit(exitoso:false)', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(COMP as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('LOCK_LOST');

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      InvalidDomainOperationException,
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        exitoso: false,
        metadata: expect.objectContaining({ outcome: 'LOCK_LOST' }),
      }),
    );
  });

  it('NOT_FOUND from dispatcher (deleted mid-flight) → EntityNotFoundException', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(COMP as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('NOT_FOUND');

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      EntityNotFoundException,
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        exitoso: false,
        metadata: expect.objectContaining({ outcome: 'NOT_FOUND' }),
      }),
    );
  });
});
