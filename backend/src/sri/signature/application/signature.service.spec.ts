import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SignatureService } from './signature.service';
import { EmisorRepository } from '../../emisores/domain/repositories/emisor.repository';
import { StorageService } from '../../../infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { EntityNotFoundException } from '../../../shared/domain/exceptions/domain.exception';

describe('SignatureService', () => {
  let service: SignatureService;
  let emisorRepository: jest.Mocked<EmisorRepository>;
  let storageService: jest.Mocked<StorageService>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
      if (key === 'SIGNATURE_QR_SIZE') return 50;
      if (key === 'SIGNATURE_TOTAL_WIDTH') return 200;
      if (key === 'SIGNATURE_DEFAULT_X') return 0;
      if (key === 'SIGNATURE_DEFAULT_Y') return 0;
      if (key === 'SIGNATURE_DEFAULT_PAGE') return -1;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<EmisorRepository>> = {
      findByCertificadoNombre: jest.fn().mockImplementation((cert: string) => {
        if (cert === 'cert_1.p12') {
          return Promise.resolve({
            id: 1,
            ruc: '1790012345001',
            razon_social: 'EMPRESA PRUEBA',
            direccion_matriz: 'Dir 1',
            obligado_contabilidad: true,
            contribuyente_rimpe: false,
            ambiente: '1',
            estado: 'ACTIVO',
          });
        }
        return Promise.resolve(null);
      }),
    };

    const mockStorage = {
      ensureBucketForRuc: jest.fn().mockResolvedValue('sri-certs'),
      exists: jest.fn().mockImplementation((_bucket: string, file: string) => {
        if (file === 'cert_1.p12') return Promise.resolve(true);
        return Promise.resolve(false);
      }),
      getObject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmisorRepository, useValue: mockRepo },
        { provide: StorageService, useValue: mockStorage },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<SignatureService>(SignatureService);
    emisorRepository = module.get(EmisorRepository);
    storageService = module.get(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQR', () => {
    it('should return a buffer for QR code', async () => {
      const qrBuffer = await service.generateQR('Test Signature Info');
      expect(qrBuffer).toBeInstanceOf(Buffer);
      expect(qrBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('signPDF - error cases', () => {
    it('should throw EntityNotFoundException if no emisor is associated with the certificate', async () => {
      await expect(
        service.signPDF(Buffer.from('fake-pdf'), 'unknown.p12', 'pass'),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityNotFoundException if cert file does not exist in storage', async () => {
      jest.spyOn(storageService, 'exists').mockResolvedValueOnce(false);
      await expect(
        service.signPDF(Buffer.from('fake-pdf'), 'cert_1.p12', 'pass'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
