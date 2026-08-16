import { Test, TestingModule } from '@nestjs/testing';
import { CertificateService } from './certificate.service';
import { CertificateStoragePort } from '../domain/ports/certificate-storage.port';
import { CertificateParserPort } from '../domain/ports/certificate-parser.port';
import { ListCertificatesUseCase } from './use-cases/list-certificates.use-case';
import { DeleteCertificateUseCase } from './use-cases/delete-certificate.use-case';
import { ExtractCertificateInfoUseCase } from './use-cases/extract-certificate-info.use-case';
import { ValidateCertificateUseCase } from './use-cases/validate-certificate.use-case';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';

describe('Certificate Module (Hexagonal)', () => {
  let service: CertificateService;
  let listUseCase: ListCertificatesUseCase;
  let deleteUseCase: DeleteCertificateUseCase;
  let extractUseCase: ExtractCertificateInfoUseCase;
  let validateUseCase: ValidateCertificateUseCase;
  let storagePort: jest.Mocked<CertificateStoragePort>;
  let parserPort: jest.Mocked<CertificateParserPort>;

  const mockCertInfo = {
    name: 'test.p12',
    size: 1024,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const mockExtractedInfo = {
    subject: { commonName: 'JUAN PEREZ', organization: 'EMPRESA', country: 'EC' },
    issuer: { commonName: 'SECURITY DATA', organization: 'SECURITY DATA' },
    validity: {
      notBefore: new Date('2025-01-01'),
      notAfter: new Date('2027-01-01'),
    },
    serialNumber: '123456',
    isExpired: false,
    daysUntilExpiry: 300,
  };

  beforeEach(async () => {
    storagePort = {
      ensureDirectory: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
      getPath: jest.fn().mockReturnValue('/certs/test.p12'),
      getDir: jest.fn().mockReturnValue('/certs'),
      list: jest.fn().mockReturnValue({
        certificates: [mockCertInfo],
        pagination: null,
        total: 1,
      }),
      delete: jest.fn().mockReturnValue(true),
      readBuffer: jest.fn().mockReturnValue(Buffer.from('fake-p12')),
    };

    parserPort = {
      extractCertInfoFromBuffer: jest.fn().mockReturnValue(mockExtractedInfo),
      validateCertificateExpiry: jest.fn().mockReturnValue({
        isValid: true,
        isExpired: false,
        isNotYetValid: false,
        expiryDate: mockExtractedInfo.validity.notAfter,
        startDate: mockExtractedInfo.validity.notBefore,
        daysUntilExpiry: 300,
        subject: mockExtractedInfo.subject,
        issuer: mockExtractedInfo.issuer,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        ListCertificatesUseCase,
        DeleteCertificateUseCase,
        ExtractCertificateInfoUseCase,
        ValidateCertificateUseCase,
        { provide: CertificateStoragePort, useValue: storagePort },
        { provide: CertificateParserPort, useValue: parserPort },
      ],
    }).compile();

    service = module.get(CertificateService);
    listUseCase = module.get(ListCertificatesUseCase);
    deleteUseCase = module.get(DeleteCertificateUseCase);
    extractUseCase = module.get(ExtractCertificateInfoUseCase);
    validateUseCase = module.get(ValidateCertificateUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(listUseCase).toBeDefined();
    expect(deleteUseCase).toBeDefined();
  });

  describe('ListCertificatesUseCase', () => {
    it('should list certificates from storage port', () => {
      const result = listUseCase.execute();
      expect(result.certificates).toHaveLength(1);
      expect(storagePort.list).toHaveBeenCalled();
    });
  });

  describe('DeleteCertificateUseCase', () => {
    it('should delegate deletion to storage port', () => {
      const result = deleteUseCase.execute('test.p12');
      expect(result).toBe(true);
      expect(storagePort.delete).toHaveBeenCalledWith('test.p12');
    });
  });

  describe('ExtractCertificateInfoUseCase', () => {
    it('should read buffer and call parser port', () => {
      const result = extractUseCase.execute('test.p12', 'pass123');
      expect(result.subject.commonName).toBe('JUAN PEREZ');
      expect(storagePort.readBuffer).toHaveBeenCalledWith('test.p12');
      expect(parserPort.extractCertInfoFromBuffer).toHaveBeenCalled();
    });
  });

  describe('ValidateCertificateUseCase', () => {
    it('should extract and validate certificate expiry', () => {
      const result = validateUseCase.execute('test.p12', 'pass123');
      expect(result.isValid).toBe(true);
      expect(parserPort.validateCertificateExpiry).toHaveBeenCalled();
    });
  });
});
