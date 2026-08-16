import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import {
  WebhookRepository,
  WebhookConfigRecord,
} from '../domain/repositories/webhook.repository';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import { CreateWebhookDto, UpdateWebhookDto } from '../interfaces/dto';

jest.mock('pg-boss', () => ({
  PgBoss: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    work: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('WebhooksService', () => {
  let service: WebhooksService;
  let repository: jest.Mocked<WebhookRepository>;
  let jobsService: jest.Mocked<JobsService>;

  const mockWebhookConfig: WebhookConfigRecord = {
    id: 'wh-123',
    nombre: 'Webhook ERP',
    url: 'https://erp.empresa.com/webhook',
    eventos: ['comprobante.autorizado', 'comprobante.rechazado'],
    emisorId: 1,
    secreto: 'whsec_secret123',
    activo: true,
    reintentosMax: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<WebhookRepository>> = {
      findAll: jest.fn().mockResolvedValue([mockWebhookConfig]),
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === 'wh-123') return Promise.resolve(mockWebhookConfig);
        return Promise.resolve(null);
      }),
      findActiveByEvent: jest.fn().mockResolvedValue([mockWebhookConfig]),
      create: jest.fn().mockImplementation((data: any) =>
        Promise.resolve({
          ...mockWebhookConfig,
          ...data,
          id: 'wh-new',
        }),
      ),
      update: jest.fn().mockImplementation((id: string, data: any) =>
        Promise.resolve({
          ...mockWebhookConfig,
          ...data,
          id,
        }),
      ),
      findLogs: jest.fn().mockResolvedValue([
        1,
        [
          {
            id: 'log-1',
            configId: 'wh-123',
            evento: 'comprobante.autorizado',
            payload: { claveAcceso: '123' },
            intento: 1,
            exitoso: true,
            createdAt: new Date(),
          },
        ],
      ]),
    };

    const mockJobs: Partial<jest.Mocked<JobsService>> = {
      send: jest.fn().mockResolvedValue('job-id-123'),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: WebhookRepository, useValue: mockRepo },
        { provide: JobsService, useValue: mockJobs },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    repository = module.get(WebhookRepository);
    jobsService = module.get(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return mapped webhook list', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('wh-123');
      expect(result[0].nombre).toBe('Webhook ERP');
    });
  });

  describe('findOne', () => {
    it('should return webhook when ID exists', async () => {
      const result = await service.findOne('wh-123');
      expect(result).toBeDefined();
      expect(result.id).toBe('wh-123');
    });

    it('should throw EntityNotFoundException when ID does not exist', async () => {
      await expect(service.findOne('non-existent')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create webhook and return secret', async () => {
      const dto: CreateWebhookDto = {
        nombre: 'Nuevo Webhook',
        url: 'https://app.com/hook',
        eventos: ['comprobante.autorizado'],
      };

      const result = await service.create(dto);
      expect(result.nombre).toBe('Nuevo Webhook');
      expect(result.secreto).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update webhook successfully', async () => {
      const dto: UpdateWebhookDto = {
        nombre: 'Nombre Actualizado',
      };

      const result = await service.update('wh-123', dto);
      expect(result.nombre).toBe('Nombre Actualizado');
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should inactivate an active webhook', async () => {
      const result = await service.delete('wh-123');
      expect(repository.update).toHaveBeenCalledWith('wh-123', {
        activo: false,
      });
    });

    it('should throw InvalidDomainOperationException if already inactive', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce({
        ...mockWebhookConfig,
        activo: false,
      });

      await expect(service.delete('wh-123')).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });
  });

  describe('regenerateSecret', () => {
    it('should update and return a new secret', async () => {
      const result = await service.regenerateSecret('wh-123');
      expect(result.secreto).toMatch(/^whsec_/);
      expect(repository.update).toHaveBeenCalledWith(
        'wh-123',
        expect.objectContaining({ secreto: expect.stringMatching(/^whsec_/) }),
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs', async () => {
      const result = await service.getLogs('wh-123', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(repository.findLogs).toHaveBeenCalledWith('wh-123', 10, 0);
    });
  });

  describe('emit', () => {
    it('should enqueue webhook dispatch jobs for active webhooks', async () => {
      await service.emit('comprobante.autorizado', { claveAcceso: '001' }, 1);
      expect(repository.findActiveByEvent).toHaveBeenCalledWith(
        'comprobante.autorizado',
        1,
      );
      expect(jobsService.send).toHaveBeenCalled();
    });

    it('should return early without sending jobs if no active webhook matches', async () => {
      jest.spyOn(repository, 'findActiveByEvent').mockResolvedValueOnce([]);
      await service.emit('comprobante.autorizado', { claveAcceso: '001' });
      expect(jobsService.send).not.toHaveBeenCalled();
    });
  });
});
