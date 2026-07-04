// Mock SriService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../services/sri.service', () => ({
  SriService: jest.fn(),
}));

// Mock PrismaService — we replace it with a stub at construction time below
jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { SriIntegrationService } from './sri-integration.service';
import { EmitirFacturaUseCase } from '../use-cases/emitir-factura.use-case';
import { NotFoundException } from '@nestjs/common';

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
        cantidad: new (require('decimal.js').Decimal)(2),
        precioUnitario: new (require('decimal.js').Decimal)(50),
        descuento: new (require('decimal.js').Decimal)(0),
        subtotal: new (require('decimal.js').Decimal)(100),
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
      emitirFactura: jest.fn().mockResolvedValue({ success: true, claveAcceso: 'XYZ' } as any),
    } as any;

    service = new SriIntegrationService(
      prisma,
      {} as any, // SriService (mocked)
      emitirFacturaUseCase,
    );
  });

  it('should load prefactura + comprobante and call emitirFactura with comprobanteExistente', async () => {
    prisma.prefacturas.findFirst.mockResolvedValue(mockPrefactura);
    prisma.comprobantes.findUnique.mockResolvedValue(mockComprobante);
    emitirFacturaUseCase.emitirFactura.mockResolvedValue({ success: true } as any);

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