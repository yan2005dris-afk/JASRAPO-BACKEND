// Mock SriService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../services/sri.service', () => ({
  SriService: jest.fn(),
}));

// Mock PrismaService — we replace it with a stub at construction time below
jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { SriIntegrationService } from './sri-integration.service';
import type { EmitirFacturaUseCase } from '../use-cases/emitir-factura.use-case';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import { ComprobanteRecord } from '../../../domain/interfaces/repository.interface';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('SriIntegrationService — emitirDesdeComprobante (T-008)', () => {
  let service: SriIntegrationService;
  let prisma: any;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let emitirFacturaUseCase: jest.Mocked<EmitirFacturaUseCase>;

  const mockDomainComprobante: ComprobanteRecord = {
    id: BigInt(42),
    uuid: 'uuid-42',
    emisor_id: 7,
    punto_emision_id: 8,
    tipo_comprobante: '01',
    ambiente: '1',
    tipo_emision: '1',
    secuencial: '000000001',
    clave_acceso: 'CLAVE-42',
    fecha_emision: '2026-07-01T00:00:00.000Z',
    estado: 'BORRADOR',
    moneda: 'DOLAR',
    receptor_identificacion: '1234567890',
    total_sin_impuestos: 100,
    importe_total: 112,
  };

  const mockPrefactura = {
    prefacturaId: BigInt(10),
    contratoId: BigInt(1),
    total: 100,
    totalPagar: 100,
    subtotal: 100,
    iva: 0,
    createdAt: new Date('2026-07-01T00:00:00Z'),
    prefacturaDetalle: [
      {
        id: BigInt(1),
        rubroId: BigInt(1),
        cantidad: 1,
        precioUnitario: 100,
        subtotal: 100,
        iva: 0,
        rubro: {
          id: BigInt(1),
          nombre: 'Servicio de Agua',
          codigo: 'AGUA-01',
        },
      },
    ],
    contrato: {
      contratoId: BigInt(1),
      cliente: {
        tipoIdentificacionId: BigInt(2),
        identificacion: '1234567890',
        nombres: 'Juan',
        apellidos: 'Pérez',
      },
    },
    puntoEmision: {
      codigo: '001',
      establecimiento: {
        codigo: '001',
        emisor: {
          ruc: '1234567890001',
          razonSocial: 'Emisor Test',
          direccionMatriz: 'Av. Matriz',
          obligadoContabilidad: true,
        },
      },
    },
  };

  beforeEach(() => {
    prisma = {
      prefacturas: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    comprobanteRepository = {
      findRecordById: jest.fn(),
      findById: jest.fn(),
      findByClaveAcceso: jest.fn(),
    } as any;

    emitirFacturaUseCase = {
      emitirFactura: jest
        .fn()
        .mockResolvedValue({ success: true, claveAcceso: 'XYZ' } as any),
    } as any;

    service = new SriIntegrationService(
      prisma,
      comprobanteRepository,
      {} as any, // SriService (mocked)
      emitirFacturaUseCase,
      mockLogger as any,
    );
  });

  it('should load prefactura + comprobante and call emitirFactura with comprobanteExistente', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(mockPrefactura);
    comprobanteRepository.findRecordById.mockResolvedValue(mockDomainComprobante);
    emitirFacturaUseCase.emitirFactura.mockResolvedValue({
      success: true,
    } as any);

    await service.emitirDesdeComprobante(BigInt(42));

    // Verify it queried prefacturas by comprobanteId
    expect(prisma.prefacturas.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { comprobanteId: BigInt(42) },
      }),
    );
    // Verify it queried the existing comprobante through repository port
    expect(comprobanteRepository.findRecordById).toHaveBeenCalledWith(BigInt(42));
    // Verify emitirFactura was called with the comprobanteExistente option
    expect(emitirFacturaUseCase.emitirFactura).toHaveBeenCalledTimes(1);
    const [dto, opts] = emitirFacturaUseCase.emitirFactura.mock.calls[0];
    expect(dto).toBeDefined();
    expect(opts).toEqual(
      expect.objectContaining({
        comprobanteExistente: expect.objectContaining({ id: BigInt(42) }),
      }),
    );
  });

  it('should throw EntityNotFoundException when prefactura is not found for comprobanteId', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(null);

    await expect(service.emitirDesdeComprobante(BigInt(99))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(comprobanteRepository.findRecordById).not.toHaveBeenCalled();
    expect(emitirFacturaUseCase.emitirFactura).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException when comprobante is not found', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(mockPrefactura);
    comprobanteRepository.findRecordById.mockResolvedValue(null);

    await expect(service.emitirDesdeComprobante(BigInt(42))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(emitirFacturaUseCase.emitirFactura).not.toHaveBeenCalled();
  });
});
