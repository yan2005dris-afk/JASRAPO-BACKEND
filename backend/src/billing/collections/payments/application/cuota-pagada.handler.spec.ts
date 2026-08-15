// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import { CuotaPagadaHandler } from './cuota-pagada.handler';
import type { PrefacturaService } from '../domain/services/prefactura.service';
import type { SRIEmissionDispatcherService } from '../../../../sri/emision/application/services/sri-emission-dispatcher.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('CuotaPagadaHandler', () => {
  let prefacturaService: jest.Mocked<PrefacturaService>;
  let sriDispatcher: jest.Mocked<SRIEmissionDispatcherService>;
  let handler: CuotaPagadaHandler;

  beforeEach(() => {
    prefacturaService = {
      findPrefacturaDetalleByCuotaConvenioId: jest.fn(),
      findPrefacturaWithDetails: jest.fn(),
      findCuotasByIds: jest.fn(),
    };
    sriDispatcher = {
      tryEmit: jest.fn().mockResolvedValue('EMITTED'),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new CuotaPagadaHandler(
      prefacturaService,
      sriDispatcher,
      mockLogger as any,
    );
  });

  it('should delegate to SRIEmissionDispatcherService when all cuotas are PAGADA', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaService.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: 200n,
      cuotaConvenioIds: [5n, 6n],
    });
    prefacturaService.findCuotasByIds.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(200n);
  });

  it('should NOT delegate when some cuotas are still not PAGADA', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaService.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: 200n,
      cuotaConvenioIds: [5n, 6n],
    });
    prefacturaService.findCuotasByIds.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PENDIENTE' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should gracefully no-op when no PrefacturaDetalle is found', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue(
      [],
    );

    await handler.procesarCuotaPagada(999n);

    expect(prefacturaService.findPrefacturaWithDetails).not.toHaveBeenCalled();
    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should no-op when Prefactura has no comprobanteId', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      { prefacturaId: 100n },
    ]);
    prefacturaService.findPrefacturaWithDetails.mockResolvedValue({
      prefacturaId: 100n,
      comprobanteId: null,
      cuotaConvenioIds: [5n],
    });

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });
});
