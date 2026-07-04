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
import { NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
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
  let emitirFacturaUseCase: jest.Mocked<EmitirFacturaUseCase>;

  const mockComprobante = {
    id: BigInt(42),
    estado: 'BORRADOR',
    importeTotal: 100,
    emisor_id: 1,
    secuencial: null,
  };

  // Prisma returns camelCase (e.g. emisorId). The service must adapt
  // it to the domain ComprobanteRecord (snake_case) before passing it
  // to EmitirFacturaUseCase.
  const mockPrismaComprobante = {
    id: BigInt(42),
    uuid: 'uuid-42',
    emisorId: 7,
    puntoEmisionId: 8,
    tipoComprobante: '01',
    ambiente: '1',
    tipoEmision: '1',
    secuencial: '000000001',
    claveAcceso: 'CLAVE-42',
    fechaEmision: new Date('2026-07-01T00:00:00Z'),
    estado: 'BORRADOR',
    estadoSri: null,
    fechaAutorizacion: null,
    numeroAutorizacion: null,
    totalSinImpuestos: new Decimal('100'),
    totalDescuento: new Decimal('0'),
    importeTotal: new Decimal('112'),
    propina: null,
    moneda: 'DOLAR',
    receptorTipoIdentificacion: '05',
    receptorIdentificacion: '1234567890',
    receptorRazonSocial: 'Juan Pérez',
    receptorDireccion: 'Av. Test 123',
    receptorEmail: 'juan@test.com',
    receptorTelefono: '0999999999',
    docModificadoTipo: null,
    docModificadoNumero: null,
    docModificadoFecha: null,
    motivo: null,
    valorModificacion: null,
    rise: null,
    periodoFiscal: null,
    idReferenciaExterna: null,
    tipoSistemaExterno: null,
  };

  const mockPrefactura = {
    prefacturaId: BigInt(10),
    comprobanteId: BigInt(42),
    contratoId: BigInt(1),
    clienteDireccion: 'Av. Test 123',
    clienteEmail: 'test@example.com',
    totalPagar: 100,
    createdAt: new Date('2026-07-01'),
    prefacturaDetalle: [
      {
        rubroId: BigInt(5),
        cantidad: new Decimal(2),
        precioUnitario: new Decimal(50),
        descuento: new Decimal(0),
        subtotal: new Decimal(100),
        rubro: { nombre: 'Servicio Test' },
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
      },
      comprobantes: {
        findUnique: jest.fn(),
      },
    };

    emitirFacturaUseCase = {
      emitirFactura: jest
        .fn()
        .mockResolvedValue({ success: true, claveAcceso: 'XYZ' } as any),
    } as any;

    service = new SriIntegrationService(
      prisma,
      {} as any, // SriService (mocked)
      emitirFacturaUseCase,
      mockLogger,
    );
  });

  it('should load prefactura + comprobante and call emitirFactura with comprobanteExistente', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(mockPrefactura);
    prisma.comprobantes.findUnique.mockResolvedValue(mockComprobante);
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
    // Verify it queried the existing comprobante
    expect(prisma.comprobantes.findUnique).toHaveBeenCalledWith({
      where: { id: BigInt(42) },
    });
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

  it('should throw NotFoundException when prefactura is not found for comprobanteId', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(null);

    await expect(service.emitirDesdeComprobante(BigInt(99))).rejects.toThrow(
      NotFoundException,
    );
    // Should not try to load comprobante if prefactura is missing
    expect(prisma.comprobantes.findUnique).not.toHaveBeenCalled();
    expect(emitirFacturaUseCase.emitirFactura).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when comprobante is not found', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(mockPrefactura);
    prisma.comprobantes.findUnique.mockResolvedValue(null);

    await expect(service.emitirDesdeComprobante(BigInt(42))).rejects.toThrow(
      NotFoundException,
    );
    // Should not call emitirFactura without comprobanteExistente
    expect(emitirFacturaUseCase.emitirFactura).not.toHaveBeenCalled();
  });
});
