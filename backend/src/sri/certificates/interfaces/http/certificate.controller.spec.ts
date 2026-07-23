import { Test, TestingModule } from '@nestjs/testing';
import { CertificateController } from './certificate.controller';
import { CertificateService } from '../../application/certificate.service';
import { CertificateExpiryCronService } from '../../application/certificate-expiry-cron.service';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';

describe('CertificateController', () => {
  let controller: CertificateController;
  let mockCertificateService: Partial<CertificateService>;
  let mockCertificateExpiryCronService: Partial<CertificateExpiryCronService>;

  beforeEach(async () => {
    mockCertificateService = {
      listCertificates: jest.fn().mockReturnValue({
        certificates: [],
        pagination: null,
        total: 0,
      }),
      deleteCertificate: jest.fn().mockReturnValue(true),
    };

    mockCertificateExpiryCronService = {
      checkExpiringCertificates: jest.fn().mockResolvedValue({
        totalEmisores: 1,
        totalWithCertificates: 1,
        expiringSoon: 0,
        expired: 1,
        alertsSent: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [
        { provide: CertificateService, useValue: mockCertificateService },
        {
          provide: CertificateExpiryCronService,
          useValue: mockCertificateExpiryCronService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CertificateController>(CertificateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call listCertificates', async () => {
      const result = await controller.findAll({});
      expect(mockCertificateService.listCertificates).toHaveBeenCalledWith({});
      expect(result.total).toBe(0);
    });
  });

  describe('checkExpiry', () => {
    it('should trigger manual certificate expiry check', async () => {
      const summary = await controller.checkExpiry();
      expect(
        mockCertificateExpiryCronService.checkExpiringCertificates,
      ).toHaveBeenCalled();
      expect(summary.alertsSent).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete certificate', async () => {
      const result = await controller.remove('cert.p12');
      expect(mockCertificateService.deleteCertificate).toHaveBeenCalledWith(
        'cert.p12',
      );
      expect(result).toBe(true);
    });
  });
});
