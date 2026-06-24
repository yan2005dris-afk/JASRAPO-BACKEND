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

  describe('generatePdf', () => {
    it('should set PDF headers and send buffer', async () => {
      const pdfBuffer = Buffer.from('pdf');
      mockGeneratePreInvoicePdf.execute.mockResolvedValue(pdfBuffer);
      const res = mockRes();

      await controller.generatePdf(5, res);

      const expectedFilenameRegex =
        /^inline; filename="prefactura-5-[a-z0-9]+\.pdf"$/;

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
