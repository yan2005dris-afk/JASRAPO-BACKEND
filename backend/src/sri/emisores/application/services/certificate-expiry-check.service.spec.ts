import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CertificateExpiryCheckService } from './certificate-expiry-check.service';
import { EmisorRepository } from '../../domain/repositories/emisor.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('CertificateExpiryCheckService', () => {
  let service: CertificateExpiryCheckService;
  let emisorRepository: jest.Mocked<EmisorRepository>;
  let mockJobService: { schedule: jest.Mock; work: jest.Mock };

  beforeEach(async () => {
    const mockEmisorRepo = {
      findAll: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    mockJobService = {
      schedule: jest.fn().mockResolvedValue(undefined),
      work: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateExpiryCheckService,
        { provide: EmisorRepository, useValue: mockEmisorRepo },
        { provide: LoggerService, useValue: mockLogger },
        { provide: 'JobService', useValue: mockJobService },
      ],
    }).compile();

    service = module.get<CertificateExpiryCheckService>(
      CertificateExpiryCheckService,
    );
    emisorRepository = module.get(EmisorRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register daily schedule onModuleInit', async () => {
    await service.onModuleInit();
    expect(mockJobService.schedule).toHaveBeenCalledWith(
      'sri-certificate-expiry-check',
      '0 8 * * *',
      {},
      expect.objectContaining({ singletonKey: 'sri-certificate-expiry-check' }),
    );
    expect(mockJobService.work).toHaveBeenCalledWith(
      'sri-certificate-expiry-check',
      expect.any(Function),
    );
  });

  it('should detect expired certificates', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    emisorRepository.findAll.mockResolvedValue([
      {
        id: 1,
        ruc: '0999999999001',
        razon_social: 'JASRAPO',
        certificado_nombre: 'firma.p12',
        certificado_valido_hasta: pastDate,
      } as any,
    ]);

    const alerts = await service.checkAllCertificates();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].estado).toBe('EXPIRADO');
    expect(alerts[0].diasRestantes).toBeLessThanOrEqual(0);
  });

  it('should detect critical expiring certificates (<= 7 days)', async () => {
    const soonDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days from now
    emisorRepository.findAll.mockResolvedValue([
      {
        id: 1,
        ruc: '0999999999001',
        razon_social: 'JASRAPO',
        certificado_nombre: 'firma.p12',
        certificado_valido_hasta: soonDate,
      } as any,
    ]);

    const alerts = await service.checkAllCertificates();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].estado).toBe('CRITICO');
    expect(alerts[0].diasRestantes).toBe(4);
  });

  it('should detect warning expiring certificates (<= 30 days)', async () => {
    const soonDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000); // 20 days from now
    emisorRepository.findAll.mockResolvedValue([
      {
        id: 1,
        ruc: '0999999999001',
        razon_social: 'JASRAPO',
        certificado_nombre: 'firma.p12',
        certificado_valido_hasta: soonDate,
      } as any,
    ]);

    const alerts = await service.checkAllCertificates();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].estado).toBe('ADVERTENCIA');
    expect(alerts[0].diasRestantes).toBe(20);
  });

  it('should ignore healthy valid certificates (> 30 days)', async () => {
    const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days from now
    emisorRepository.findAll.mockResolvedValue([
      {
        id: 1,
        ruc: '0999999999001',
        razon_social: 'JASRAPO',
        certificado_nombre: 'firma.p12',
        certificado_valido_hasta: futureDate,
      } as any,
    ]);

    const alerts = await service.checkAllCertificates();
    expect(alerts).toHaveLength(0);
  });
});
