import { Test, TestingModule } from '@nestjs/testing';
import { CertificateService } from './certificate.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import * as fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  unlinkSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('CertificateService', () => {
  let service: CertificateService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeAll(() => {
    process.env.CERTS_DIR = '/tmp/test-certs';
  });

  afterAll(() => {
    delete process.env.CERTS_DIR;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveSafePath / security', () => {
    it('should throw InvalidDomainOperationException on path traversal attempt', () => {
      expect(() =>
        service.getCertificatePath('../../../etc/passwd'),
      ).toThrow(InvalidDomainOperationException);
    });
  });

  describe('certificateExists', () => {
    it('should return true when file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      expect(service.certificateExists('valid.p12')).toBe(true);
    });

    it('should return false when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(service.certificateExists('missing.p12')).toBe(false);
    });
  });

  describe('deleteCertificate', () => {
    it('should throw InvalidDomainOperationException when file does not end with .p12', () => {
      expect(() => service.deleteCertificate('cert.txt')).toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw EntityNotFoundException when certificate does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => service.deleteCertificate('missing.p12')).toThrow(
        EntityNotFoundException,
      );
    });

    it('should unlink file and return true when certificate exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = service.deleteCertificate('valid.p12');
      expect(result).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('getCertificateInfo', () => {
    it('should throw EntityNotFoundException when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => service.getCertificateInfo('nonexistent.p12')).toThrow(
        EntityNotFoundException,
      );
    });

    it('should return certificate info when file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({
        size: 2048,
        birthtime: new Date('2026-01-01'),
        mtime: new Date('2026-01-02'),
      });

      const info = service.getCertificateInfo('cert.p12');
      expect(info.name).toBe('cert.p12');
      expect(info.size).toBe(2048);
    });
  });
});
