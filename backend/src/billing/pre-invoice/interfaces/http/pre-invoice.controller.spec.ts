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
import { PreInvoiceController } from './pre-invoice.controller';
import { PreInvoiceService } from '../../application/pre-invoice.service';
import { GeneratePreInvoicePdfUseCase } from '../../application/use-cases/generate-pre-invoice-pdf.use-case';
import { SendPreInvoiceByEmailUseCase } from '../../application/use-cases/send-pre-invoice-by-email.use-case';
import { preInvoiceRow } from '../../__test-utils__/pre-invoice-row.factory';
import { Prisma } from 'src/generated/prisma/client';

const mockRes = () => {
  const res: any = {};
  res.set = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

describe('PreInvoiceController', () => {
  let controller: PreInvoiceController;

  const mockPreInvoice = preInvoiceRow({
    prefacturaId: 1n,
    uuid: 'uuid-1',
    contratoId: 1n,
    periodoId: 1,
    subtotal: new Prisma.Decimal(150),
    iva: new Prisma.Decimal(17.25),
    descuentoTotal: new Prisma.Decimal(0),
    totalPagar: new Prisma.Decimal(150),
    deudaAnterior: new Prisma.Decimal(0),
    saldoVencido: new Prisma.Decimal(0),
    abono: new Prisma.Decimal(0),
    saldoActual: new Prisma.Decimal(150),
    meses_atrasado: 0,
    estado: 'GENERADA',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  });

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
    it('should pass filters and pagination to service and return ResponseDtos', async () => {
      const paginated = {
        data: [mockPreInvoice],
        meta: { total: 1, page: 2, limit: 5 } as any,
      };
      mockPreInvoiceService.findAll.mockResolvedValue(paginated);

      const query = {
        page: 2,
        limit: 5,
        loteId: 10,
        periodoId: 3,
        estado: 'APROBADA',
        contratoId: '1',
        identificacion: '123',
      };
      const result = await controller.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].prefacturaId).toBe(1);
      expect(mockPreInvoiceService.findAll).toHaveBeenCalledWith(2, 5, {
        loteId: 10,
        periodoId: 3,
        estado: 'APROBADA',
        contratoId: '1',
        identificacion: '123',
      });
    });
  });

  describe('findOne', () => {
    it('should return ResponseDto from service', async () => {
      mockPreInvoiceService.findOne.mockResolvedValue(mockPreInvoice);

      const result = await controller.findOne(1);

      expect(result.prefacturaId).toBe(1);
      expect(mockPreInvoiceService.findOne).toHaveBeenCalledWith(1);
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
    it('should delegate to service with correct args and return ResponseDto', async () => {
      mockPreInvoiceService.updateState.mockResolvedValue(
        preInvoiceRow({ ...mockPreInvoice, estado: 'APROBADA' }),
      );
      const dto = { action: 'APROBAR', motivoRechazo: undefined };
      const user = { email: 'reviewer@test.com' };

      const result = await controller.updateState(1, dto as any, user);

      expect(result.estado).toBe('APROBADA');
      expect(mockPreInvoiceService.updateState).toHaveBeenCalledWith(
        1,
        'APROBAR',
        'reviewer@test.com',
        undefined,
      );
    });

    it('should use user.sub when email is not present', async () => {
      mockPreInvoiceService.updateState.mockResolvedValue(mockPreInvoice);
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
