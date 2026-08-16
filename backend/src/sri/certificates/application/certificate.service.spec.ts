import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CertificateService } from './certificate.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('CertificateService', () => {
  let service: CertificateService;

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
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
});
