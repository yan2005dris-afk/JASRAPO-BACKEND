import { NotFoundException, ConflictException } from '@nestjs/common';
import { EmitirComprobanteManualUseCase } from './emitir-comprobante-manual.use-case';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';
import type { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import type {
  SRIEmissionDispatcherService,
  EmissionOutcome,
} from '../../../../billing/collections/payments/application/sri-emission-dispatcher.service';
import type { AuditService } from '../../../../infrastructure/audit/audit.service';

/**
 * Use case `EmitirComprobanteManualUseCase` (sdd/sri-emision-modo-manual-automatico)
 *
 * Responsibilities:
 *   - Look up the comprobante by `claveAcceso`. 404 if missing.
 *   - Validate estado ∈ {BORRADOR, POR_EMITIR}. 409 otherwise.
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

  it('R-6/S1: POR_EMITIR → calls tryEmitManual + writes emision-manual audit row', async () => {
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

  it('R-6/S2: BORRADOR → calls tryEmitManual + writes audit with previousState=BORRADOR', async () => {
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

  it('R-6/S3: AUTORIZADO → 409 ConflictException, no dispatcher call, no audit', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue({
      ...COMP,
      estado: ComprobanteEstado.AUTORIZADO,
    } as any);

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(sriDispatcher.tryEmitManual).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('R-6/S4: unknown claveAcceso → 404 NotFoundException, no dispatcher call, no audit', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(null);

    await expect(useCase.execute(CLAVE, CURRENT_USER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(sriDispatcher.tryEmitManual).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('dispatches INVALID_STATE from tryEmitManual without throwing', async () => {
    comprobanteRepository.findByClaveAcceso.mockResolvedValue(COMP as any);
    sriDispatcher.tryEmitManual.mockResolvedValue('INVALID_STATE');

    const outcome = await useCase.execute(CLAVE, CURRENT_USER);

    expect(outcome).toBe('INVALID_STATE');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        exitoso: false,
        metadata: expect.objectContaining({ outcome: 'INVALID_STATE' }),
      }),
    );
  });
});
