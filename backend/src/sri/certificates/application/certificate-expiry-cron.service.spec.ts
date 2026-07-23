import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CertificateExpiryCronService, CERTIFICATE_EXPIRY_CHECK_JOB } from './certificate-expiry-cron.service';
import { EmisorRepository } from '../../emisores/domain/repositories/emisor.repository';
import { MailService } from '../../../infrastructure/mail/application/mail.service';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import { EmisorRecord } from '../../domain/interfaces/repository.interface';

describe('CertificateExpiryCronService', () => {
  let service: CertificateExpiryCronService;
  let mockEmisorRepository: Partial<EmisorRepository>;
  let mockMailService: Partial<MailService>;
  let mockConfigService: Partial<ConfigService>;
  let mockJobsService: Partial<JobsService>;

  const now = new Date('2026-07-23T12:00:00Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    mockEmisorRepository = {
      findAll: jest.fn(),
    };

    mockMailService = {
      sendCertificateExpiryAlert: jest.fn().mockResolvedValue('job-123'),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'CERTIFICATE_ALERT_EMAIL') return 'alerts@jasrapo.com';
        if (key === 'CERTIFICATE_WARNING_DAYS') return 30;
        if (key === 'CERTIFICATE_EXPIRY_CRON') return '0 8 * * *';
        return defaultValue;
      }),
    };

    mockJobsService = {
      work: jest.fn().mockResolvedValue(undefined),
      schedule: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateExpiryCronService,
        { provide: EmisorRepository, useValue: mockEmisorRepository },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JobsService, useValue: mockJobsService },
      ],
    }).compile();

    service = module.get<CertificateExpiryCronService>(
      CertificateExpiryCronService,
    );
  });

  afterEach(() => {
    service.onApplicationShutdown();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should register job with pg-boss if JobsService is available', async () => {
      await service.onApplicationBootstrap();

      expect(mockJobsService.work).toHaveBeenCalledWith(
        CERTIFICATE_EXPIRY_CHECK_JOB,
        expect.any(Function),
      );
      expect(mockJobsService.schedule).toHaveBeenCalledWith(
        CERTIFICATE_EXPIRY_CHECK_JOB,
        '0 8 * * *',
      );
    });

    it('should fallback to setInterval if pg-boss schedule fails', async () => {
      (mockJobsService.schedule as jest.Mock).mockRejectedValueOnce(
        new Error('pg-boss error'),
      );
      (mockEmisorRepository.findAll as jest.Mock).mockResolvedValue([]);

      await service.onApplicationBootstrap();

      expect(mockEmisorRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('checkExpiringCertificates', () => {
    it('should identify expired and expiring certificates and send email alerts', async () => {
      const expiredDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const expiringSoonDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // in 10 days
      const healthyDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // in 60 days

      const mockEmisores: EmisorRecord[] = [
        {
          id: 1,
          ruc: '0990000000001',
          razon_social: 'Empresa Expirada',
          direccion_matriz: 'Matriz 1',
          obligado_contabilidad: true,
          contribuyente_rimpe: false,
          ambiente: '1',
          estado: 'ACTIVO',
          certificado_valido_hasta: expiredDate,
          certificado_sujeto: 'CN=Expirado, O=Test',
        },
        {
          id: 2,
          ruc: '0990000000002',
          razon_social: 'Empresa Por Expirar',
          direccion_matriz: 'Matriz 2',
          obligado_contabilidad: true,
          contribuyente_rimpe: false,
          ambiente: '1',
          estado: 'ACTIVO',
          certificado_valido_hasta: expiringSoonDate,
          certificado_sujeto: 'CN=PorExpirar, O=Test',
        },
        {
          id: 3,
          ruc: '0990000000003',
          razon_social: 'Empresa Saludable',
          direccion_matriz: 'Matriz 3',
          obligado_contabilidad: true,
          contribuyente_rimpe: false,
          ambiente: '1',
          estado: 'ACTIVO',
          certificado_valido_hasta: healthyDate,
          certificado_sujeto: 'CN=Ok, O=Test',
        },
        {
          id: 4,
          ruc: '0990000000004',
          razon_social: 'Empresa Inactiva Expirada',
          direccion_matriz: 'Matriz 4',
          obligado_contabilidad: true,
          contribuyente_rimpe: false,
          ambiente: '1',
          estado: 'INACTIVO',
          certificado_valido_hasta: expiredDate,
        },
      ];

      (mockEmisorRepository.findAll as jest.Mock).mockResolvedValue(
        mockEmisores,
      );

      const summary = await service.checkExpiringCertificates();

      expect(summary.totalEmisores).toBe(3); // only active ones
      expect(summary.totalWithCertificates).toBe(3);
      expect(summary.expired).toBe(1);
      expect(summary.expiringSoon).toBe(1);
      expect(summary.alertsSent).toBe(2);

      expect(mockMailService.sendCertificateExpiryAlert).toHaveBeenCalledTimes(2);

      expect(mockMailService.sendCertificateExpiryAlert).toHaveBeenCalledWith(
        'alerts@jasrapo.com',
        expect.objectContaining({
          ruc: '0990000000001',
          razonSocial: 'Empresa Expirada',
          isExpired: true,
        }),
      );

      expect(mockMailService.sendCertificateExpiryAlert).toHaveBeenCalledWith(
        'alerts@jasrapo.com',
        expect.objectContaining({
          ruc: '0990000000002',
          razonSocial: 'Empresa Por Expirar',
          isExpired: false,
          diasHastaExpiracion: 10,
        }),
      );
    });

    it('should handle errors gracefully when mail dispatch fails for one emisor', async () => {
      const expiredDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const mockEmisores: EmisorRecord[] = [
        {
          id: 1,
          ruc: '0990000000001',
          razon_social: 'Empresa Error',
          direccion_matriz: 'Matriz 1',
          obligado_contabilidad: true,
          contribuyente_rimpe: false,
          ambiente: '1',
          estado: 'ACTIVO',
          certificado_valido_hasta: expiredDate,
        },
      ];

      (mockEmisorRepository.findAll as jest.Mock).mockResolvedValue(
        mockEmisores,
      );
      (mockMailService.sendCertificateExpiryAlert as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP down'),
      );

      const summary = await service.checkExpiringCertificates();

      expect(summary.expired).toBe(1);
      expect(summary.alertsSent).toBe(0);
    });
  });
});
