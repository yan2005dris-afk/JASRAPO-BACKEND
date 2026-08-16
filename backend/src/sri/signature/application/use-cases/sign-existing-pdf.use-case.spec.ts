import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SignExistingPdfUseCase } from './sign-existing-pdf.use-case';
import { SignatureService } from '../signature.service';
import { CertificateService } from '../../../certificates/application/certificate.service';
import { InvalidDomainOperationException } from '../../../../shared/domain/exceptions/domain.exception';

describe('SignExistingPdfUseCase', () => {
  let useCase: SignExistingPdfUseCase;
  let signatureService: jest.Mocked<Partial<SignatureService>>;
  let certificateService: jest.Mocked<Partial<CertificateService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(async () => {
    signatureService = {
      signPDF: jest.fn().mockResolvedValue(Buffer.from('signed-pdf-content')),
    };

    certificateService = {
      validateCertificateExpiry: jest.fn().mockReturnValue({
        isValid: true,
        isExpired: false,
        isNotYetValid: false,
        expiryDate: new Date('2028-01-01'),
        startDate: new Date('2025-01-01'),
        daysUntilExpiry: 365,
        subject: { commonName: 'TEST', organization: 'TEST', country: 'EC' },
        issuer: { commonName: 'CA', organization: 'CA' },
      }),
    };

    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignExistingPdfUseCase,
        { provide: SignatureService, useValue: signatureService },
        { provide: CertificateService, useValue: certificateService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    useCase = module.get<SignExistingPdfUseCase>(SignExistingPdfUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw InvalidDomainOperationException if certFile or password missing', async () => {
    await expect(
      useCase.execute({
        fileName: 'doc.pdf',
        certFile: '',
        password: '',
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException if certificate is expired or invalid', async () => {
    (certificateService.validateCertificateExpiry as jest.Mock).mockReturnValue({
      isValid: false,
      reason: 'Certificado expirado',
    });

    await expect(
      useCase.execute({
        fileName: 'doc.pdf',
        certFile: 'cert.p12',
        password: 'pass',
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });
});
