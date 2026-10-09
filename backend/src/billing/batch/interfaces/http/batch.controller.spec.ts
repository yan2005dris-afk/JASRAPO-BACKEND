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
import { BatchController } from './batch.controller';
import { BatchService } from '../../application/batch.service';
import { SendBatchEmailsUseCase } from '../../application/use-cases/send-batch-emails.use-case';
import { batchRow } from '../../__test-utils__/batch-row.factory';

describe('BatchController', () => {
  let controller: BatchController;

  const mockBatch = batchRow({
    loteId: BigInt(1),
    comunidadId: 1,
    periodoId: 1,
    estado: 'BORRADOR',
    totalMonto: 100,
    notas: null,
    creadoPor: 'admin',
    totalEmisiones: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockBatchService = {
    generate: jest.fn(),
    findAllStates: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSendBatchEmails = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        { provide: BatchService, useValue: mockBatchService },
        { provide: SendBatchEmailsUseCase, useValue: mockSendBatchEmails },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('should call service.generate and return response dto', async () => {
      mockBatchService.generate.mockResolvedValue({
        message: 'ok',
        batchId: 1,
      });

      const result = await controller.generate({ periodoId: 1 });

      expect(result).toEqual({ message: 'ok', batchId: 1 });
      expect(mockBatchService.generate).toHaveBeenCalledWith({ periodoId: 1 });
    });
  });

  describe('findAllStates', () => {
    it('should return all batch states', async () => {
      const states = [{ estado: 'BORRADOR' }];
      mockBatchService.findAllStates.mockResolvedValue(states);

      const result = await controller.findAllStates();

      expect(result).toEqual(states);
      expect(mockBatchService.findAllStates).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated ResponseDto list', async () => {
      mockBatchService.findAll.mockResolvedValue({
        data: [mockBatch],
        meta: { total: 1, page: 1, limit: 10 } as any,
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].loteId).toBe(1);
      expect(mockBatchService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return ResponseDto for batch', async () => {
      mockBatchService.findOne.mockResolvedValue(mockBatch);

      const result = await controller.findOne(1);

      expect(result.loteId).toBe(1);
      expect(mockBatchService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('sendEmail', () => {
    it('should delegate to sendBatchEmails use case', async () => {
      mockSendBatchEmails.execute.mockResolvedValue({
        queued: 2,
        skipped: 0,
        batches: 1,
      });

      const result = await controller.sendEmail(1);

      expect(result).toEqual({ queued: 2, skipped: 0, batches: 1 });
      expect(mockSendBatchEmails.execute).toHaveBeenCalledWith(1);
    });
  });
});
