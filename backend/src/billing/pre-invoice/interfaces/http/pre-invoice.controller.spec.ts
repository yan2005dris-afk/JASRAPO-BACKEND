jest.mock('puppeteer', () => ({}));
jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    createQueue: jest.fn(),
    send: jest.fn(),
    insert: jest.fn(),
    work: jest.fn(),
  })),
}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PreInvoiceController } from './pre-invoice.controller';
import { PreInvoiceService } from '../../application/pre-invoice.service';
import { GeneratePreInvoicePdfUseCase } from '../../application/use-cases/generate-pre-invoice-pdf.use-case';
import { SendPreInvoiceByEmailUseCase } from '../../application/use-cases/send-pre-invoice-by-email.use-case';
import { DecimalToStringInterceptor } from 'src/infrastructure/common/interceptors/decimal-to-string.interceptor';
import { of } from 'rxjs';

const mockRes = () => {
  const res: any = {};
  res.set = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

describe('PreInvoiceController', () => {
  let controller: PreInvoiceController;

  const mockPreInvoiceService = {
    findAllStates: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateState: jest.fn(),
  };

  const mockGeneratePreInvoicePdf = {
    execute: jest.fn(),
  };

  const mockSendPreInvoiceByEmail = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreInvoiceController],
      providers: [
        { provide: PreInvoiceService, useValue: mockPreInvoiceService },
        {
          provide: GeneratePreInvoicePdfUseCase,
          useValue: mockGeneratePreInvoicePdf,
        },
        {
          provide: SendPreInvoiceByEmailUseCase,
          useValue: mockSendPreInvoiceByEmail,
        },
      ],
    }).compile();

    controller = module.get<PreInvoiceController>(PreInvoiceController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllStates', () => {
    it('should return states from service', async () => {
      const states = [{ estado: 'GENERADA' }, { estado: 'APROBADA' }];
      mockPreInvoiceService.findAllStates.mockResolvedValue(states);

      const result = await controller.findAllStates();

      expect(result).toEqual(states);
      expect(mockPreInvoiceService.findAllStates).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should pass filters and pagination to service', async () => {
      const paginated = { data: [], meta: {} as any };
      mockPreInvoiceService.findAll.mockResolvedValue(paginated);

      const query = {
        page: 2,
        limit: 5,
        loteId: 10,
        periodoId: 3,
        estado: 'APROBADA',
        contratoId: 1,
        identificacion: '123',
      };
      const result = await controller.findAll(query as any);

      expect(result).toBe(paginated);
      expect(mockPreInvoiceService.findAll).toHaveBeenCalledWith(2, 5, {
        loteId: 10,
        periodoId: 3,
        estado: 'APROBADA',
        contratoId: 1,
        identificacion: '123',
      });
    });
  });

  describe('findOne', () => {
    it('should return pre-invoice from service', async () => {
      const preInvoice = { prefacturaId: 1 };
      mockPreInvoiceService.findOne.mockResolvedValue(preInvoice);

      const result = await controller.findOne(1);

      expect(result).toEqual(preInvoice);
      expect(mockPreInvoiceService.findOne).toHaveBeenCalledWith(1);
    });
  });

  // Contract test: simulate the wire format the controller+interceptor pair
  // produces for `GET /api/v1/pre-invoices/:id`. The service returns Prisma
  // `Decimal` instances; the global DecimalToStringInterceptor must convert
  // every monetary field to a string with no float precision drift, so SRI
  // reconciliation can match the wire bytes against the invoice exactly.
  describe('contract: GET /pre-invoices/:id wire format', () => {
    function runInterceptor(
      interceptor: DecimalToStringInterceptor,
      data: unknown,
    ): Promise<unknown> {
      return new Promise((resolve, reject) => {
        interceptor.intercept({} as any, { handle: () => of(data) }).subscribe({
          next: (result) => resolve(result),
          error: (err) =>
            reject(err instanceof Error ? err : new Error(String(err))),
        });
      });
    }

    it('serializes all monetary fields as strings (no float drift)', async () => {
      const preInvoice = {
        prefacturaId: 1,
        uuid: 'a1b2c3d4',
        contratoId: 99,
        loteId: 7,
        periodoId: 12,
        subtotal: new Decimal('150.00'),
        iva: new Decimal('17.25'),
        descuentoTotal: new Decimal('0.00'),
        totalPagar: new Decimal('150.00'),
        deudaAnterior: new Decimal('0.00'),
        saldoVencido: new Decimal('0.00'),
        abono: new Decimal('0.00'),
        saldoActual: new Decimal('150.00'),
        estado: 'GENERADA',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        detalles: [
          {
            prefacturaDetalleId: 1,
            descripcion: 'Cargo fijo',
            cantidad: 1,
            precioUnitario: new Decimal('150.00'),
            subtotal: new Decimal('150.00'),
            iva: new Decimal('17.25'),
            total: new Decimal('150.00'),
          },
        ],
      };
      mockPreInvoiceService.findOne.mockResolvedValue(preInvoice);

      const interceptor = new DecimalToStringInterceptor();
      const serviceResult = await controller.findOne(1);
      const wireResult = (await runInterceptor(
        interceptor,
        serviceResult,
      )) as any;

      // Monetary fields are strings, exact lossless Decimal -> string.
      expect(typeof wireResult.subtotal).toBe('string');
      expect(typeof wireResult.iva).toBe('string');
      expect(typeof wireResult.totalPagar).toBe('string');
      expect(typeof wireResult.saldoActual).toBe('string');
      expect(wireResult.subtotal).toBe(new Decimal('150.00').toString());
      expect(wireResult.iva).toBe(new Decimal('17.25').toString());
      expect(wireResult.totalPagar).toBe(new Decimal('150.00').toString());
      expect(wireResult.saldoActual).toBe(new Decimal('150.00').toString());

      // Nested detalle monetary fields also serialized.
      expect(typeof wireResult.detalles[0].precioUnitario).toBe('string');
      expect(typeof wireResult.detalles[0].subtotal).toBe('string');
      expect(typeof wireResult.detalles[0].iva).toBe('string');
      expect(typeof wireResult.detalles[0].total).toBe('string');

      // Non-Decimal fields remain untouched.
      expect(wireResult.prefacturaId).toBe(1);
      expect(wireResult.uuid).toBe('a1b2c3d4');
      expect(wireResult.estado).toBe('GENERADA');
      expect(wireResult.detalles[0].cantidad).toBe(1);
      expect(wireResult.detalles[0].descripcion).toBe('Cargo fijo');
      expect(wireResult.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('generatePdf', () => {
    it('should set PDF headers and send buffer', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockGeneratePreInvoicePdf.execute.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.generatePdf(5, res);

      const expectedFilenameRegex =
        /^inline; filename="prefactura-[a-z0-9]+\.pdf"$/;

      expect(mockGeneratePreInvoicePdf.execute).toHaveBeenCalledWith(5);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': expect.stringMatching(expectedFilenameRegex),
        'Content-Length': pdfBuffer.length,
      });
      expect(res.end).toHaveBeenCalledWith(pdfBuffer);
    });

    it('should propagate NotFoundException from use case', async () => {
      mockGeneratePreInvoicePdf.execute.mockRejectedValue(
        new NotFoundException('not found'),
      );

      await expect(controller.generatePdf(99, mockRes())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateState', () => {
    it('should delegate to service with correct args', async () => {
      const updated = { prefacturaId: 1, estado: 'APROBADA' };
      mockPreInvoiceService.updateState.mockResolvedValue(updated);
      const dto = { action: 'APROBAR', motivoRechazo: undefined };
      const user = { email: 'reviewer@test.com' };

      const result = await controller.updateState(1, dto as any, user);

      expect(result).toEqual(updated);
      expect(mockPreInvoiceService.updateState).toHaveBeenCalledWith(
        1,
        'APROBAR',
        'reviewer@test.com',
        undefined,
      );
    });

    it('should use user.sub when email is not present', async () => {
      mockPreInvoiceService.updateState.mockResolvedValue({});
      const dto = { action: 'RECHAZAR', motivoRechazo: 'Error en datos' };
      const user = { sub: 42 };

      await controller.updateState(1, dto as any, user);

      expect(mockPreInvoiceService.updateState).toHaveBeenCalledWith(
        1,
        'RECHAZAR',
        '42',
        'Error en datos',
      );
    });
  });
});
