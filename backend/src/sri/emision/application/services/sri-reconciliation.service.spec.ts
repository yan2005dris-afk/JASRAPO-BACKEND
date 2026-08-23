import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  SriReconciliationService,
  SRI_RECONCILIATION_JOB,
} from './sri-reconciliation.service';
import { SriService } from './sri.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('SriReconciliationService', () => {
  let service: SriReconciliationService;
  let sriService: jest.Mocked<SriService>;
  let mockJobService: { schedule: jest.Mock; work: jest.Mock };

  beforeEach(async () => {
    const mockSriService = {
      sincronizarConSri: jest.fn(),
    };

    mockJobService = {
      schedule: jest.fn().mockResolvedValue(undefined),
      work: jest.fn().mockResolvedValue(undefined),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SriReconciliationService,
        { provide: SriService, useValue: mockSriService },
        { provide: LoggerService, useValue: mockLogger },
        { provide: 'JobService', useValue: mockJobService },
      ],
    }).compile();

    service = module.get<SriReconciliationService>(SriReconciliationService);
    sriService = module.get(SriService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register periodic reconciliation schedule onModuleInit', async () => {
    await service.onModuleInit();
    expect(mockJobService.schedule).toHaveBeenCalledWith(
      SRI_RECONCILIATION_JOB,
      '*/15 * * * *',
      {},
      expect.objectContaining({ singletonKey: SRI_RECONCILIATION_JOB }),
    );
    expect(mockJobService.work).toHaveBeenCalledWith(
      SRI_RECONCILIATION_JOB,
      expect.any(Function),
    );
  });

  it('should call sincronizarConSri with pending/firmado states and reintentar flag', async () => {
    sriService.sincronizarConSri.mockResolvedValue({
      procesados: 5,
      actualizados: 3,
      reintentados: 2,
      errores: 0,
      detalle: [],
    });

    const result = await service.reconcilePendingComprobantes();
    expect(sriService.sincronizarConSri).toHaveBeenCalledWith({
      estados: ['PENDIENTE', 'EN_PROCESO', 'FIRMADO', 'DEVUELTA'],
      reintentar: true,
      limite: 50,
    });
    expect(result.procesados).toBe(5);
    expect(result.actualizados).toBe(3);
  });
});
