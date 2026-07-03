// Mock SriService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../application/services/sri.service', () => ({
  SriService: jest.fn(),
}));

import { SriEmisionProcessor, SRIJobWorker } from './sri-emision.processor';
import { EmitirFacturaUseCase } from '../../../application/use-cases/emitir-factura.use-case';
import { EmitirNotaCreditoUseCase } from '../../../application/use-cases/emitir-nota-credito.use-case';
import { EmitirNotaDebitoUseCase } from '../../../application/use-cases/emitir-nota-debito.use-case';
import { EmitirRetencionUseCase } from '../../../application/use-cases/emitir-retencion.use-case';
import { SriIntegrationService } from '../../../application/services/sri-integration.service';

describe('SriEmisionProcessor (T-007)', () => {
  let processor: SriEmisionProcessor;
  let jobsService: jest.Mocked<SRIJobWorker>;
  let emitirFacturaUseCase: jest.Mocked<EmitirFacturaUseCase>;
  let emitirNotaCreditoUseCase: jest.Mocked<EmitirNotaCreditoUseCase>;
  let emitirNotaDebitoUseCase: jest.Mocked<EmitirNotaDebitoUseCase>;
  let emitirRetencionUseCase: jest.Mocked<EmitirRetencionUseCase>;
  let sriIntegrationService: jest.Mocked<SriIntegrationService>;

  beforeEach(() => {
    jobsService = {
      work: jest.fn().mockResolvedValue(undefined),
    } as any;

    emitirFacturaUseCase = {
      emitirFactura: jest.fn().mockResolvedValue({ success: true, claveAcceso: 'X' }),
    } as any;

    emitirNotaCreditoUseCase = {
      emitirNotaCredito: jest.fn().mockResolvedValue({ success: true }),
    } as any;

    emitirNotaDebitoUseCase = {
      emitirNotaDebito: jest.fn().mockResolvedValue({ success: true }),
    } as any;

    emitirRetencionUseCase = {
      emitirRetencion: jest.fn().mockResolvedValue({ success: true }),
    } as any;

    sriIntegrationService = {
      emitirDesdeComprobante: jest.fn().mockResolvedValue({ success: true }),
    } as any;

    processor = new SriEmisionProcessor(
      jobsService,
      emitirFacturaUseCase,
      emitirNotaCreditoUseCase,
      emitirNotaDebitoUseCase,
      emitirRetencionUseCase,
      sriIntegrationService,
    );
  });

  it('FACTURA_DESDE_PREFACTURA — should dispatch to sriIntegrationService.emitirDesdeComprobante', async () => {
    const job = {
      id: 'job-1',
      data: {
        tipo: 'FACTURA_DESDE_PREFACTURA',
        comprobanteId: '42',
      },
    };

    await processor.processEmision(job);

    expect(sriIntegrationService.emitirDesdeComprobante).toHaveBeenCalledTimes(1);
    expect(sriIntegrationService.emitirDesdeComprobante).toHaveBeenCalledWith(
      BigInt('42'),
    );
    // Should NOT call the other paths
    expect(emitirFacturaUseCase.emitirFactura).not.toHaveBeenCalled();
    expect(emitirNotaCreditoUseCase.emitirNotaCredito).not.toHaveBeenCalled();
    expect(emitirNotaDebitoUseCase.emitirNotaDebito).not.toHaveBeenCalled();
    expect(emitirRetencionUseCase.emitirRetencion).not.toHaveBeenCalled();
  });

  it('FACTURA — regression: should still dispatch to emitirFacturaUseCase.emitirFactura', async () => {
    const job = {
      id: 'job-2',
      data: {
        tipo: 'FACTURA',
        dto: { foo: 'bar' },
      },
    };

    await processor.processEmision(job);

    expect(emitirFacturaUseCase.emitirFactura).toHaveBeenCalledTimes(1);
    expect(emitirFacturaUseCase.emitirFactura).toHaveBeenCalledWith({ foo: 'bar' });
    // Should NOT call the FACTURA_DESDE_PREFACTURA path
    expect(sriIntegrationService.emitirDesdeComprobante).not.toHaveBeenCalled();
  });

  it('unknown tipo — should throw an error', async () => {
    const job = {
      id: 'job-3',
      data: {
        tipo: 'UNKNOWN_TYPE',
      },
    };

    await expect(processor.processEmision(job)).rejects.toThrow(
      /Tipo de comprobante no soportado/,
    );
  });
});