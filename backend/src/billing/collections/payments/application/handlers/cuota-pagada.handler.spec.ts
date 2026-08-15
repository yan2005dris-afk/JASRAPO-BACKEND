// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import { CuotaPagadaHandler } from './cuota-pagada.handler';
import type { PrefacturaQueryRepository } from '../../domain/repositories/prefactura-query.repository';
import type { SRIEmissionDispatcherService } from '../../../../../sri/emision/application/services/sri-emission-dispatcher.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('CuotaPagadaHandler', () => {
  let prefacturaRepository: jest.Mocked<PrefacturaQueryRepository>;
  let sriDispatcher: jest.Mocked<SRIEmissionDispatcherService>;
  let handler: CuotaPagadaHandler;

  beforeEach(() => {
    prefacturaRepository = {
      findPrefacturaDetalleByCuotaConvenioId: jest.fn(),
      findPrefacturaWithDetails: jest.fn(),
      findCuotasByIds: jest.fn(),
    };
    sriDispatcher = {
      tryEmit: jest.fn().mockResolvedValue('EMITTED'),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new CuotaPagadaHandler(
      prefacturaRepository,
      sriDispatcher,
      mockLogger as any,
    );
  });

  it('should delegate to SRIEmissionDispatcherService when all cuotas are PAGADA', async () => {
    prefacturaRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaRepository.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: 200n,
      cuotaConvenioIds: [5n, 6n],
    });
    prefacturaRepository.findCuotasByIds.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(200n);
  });

  it('should NOT delegate when some cuotas are still not PAGADA', async () => {
    prefacturaRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaRepository.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: 200n,
      cuotaConvenioIds: [5n, 6n],
    });
    prefacturaRepository.findCuotasByIds.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PENDIENTE' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should gracefully no-op when no PrefacturaDetalle is found', async () => {
    prefacturaRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue(
      [],
    );

    await handler.procesarCuotaPagada(999n);

    expect(prefacturaRepository.findPrefacturaWithDetails).not.toHaveBeenCalled();
    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should no-op when Prefactura has no comprobanteId', async () => {
    prefacturaRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaRepository.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: null,
      cuotaConvenioIds: [5n],
    });

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });
});
