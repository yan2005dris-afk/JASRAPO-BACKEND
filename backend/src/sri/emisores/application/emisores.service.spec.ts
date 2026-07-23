import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmisoresService } from './emisores.service';
import { EmisorRepository } from '../domain/repositories/emisor.repository';
import { EncryptionService } from '../../../infrastructure/encryption/encryption.service';
import { StorageService } from '../../../infrastructure/storage/storage.service';
import { XmlSignerService } from '../../emision/infrastructure/xml/xml-signer.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('EmisoresService', () => {
  let service: EmisoresService;
  let repository: jest.Mocked<EmisorRepository>;
  let encryptionService: jest.Mocked<EncryptionService>;
  let storageService: jest.Mocked<StorageService>;
  let xmlSignerService: jest.Mocked<XmlSignerService>;

  const mockEmisorRecord = {
    id: 1,
    ruc: '1790012345001',
    razon_social: 'Empresa Test',
    nombre_comercial: 'Test',
    direccion_matriz: 'Av. Siempre Viva 123',
    obligado_contabilidad: false,
    contribuyente_especial: undefined,
    agente_retencion: undefined,
    contribuyente_rimpe: false,
    ambiente: '1',
    estado: 'ACTIVO',
    certificado_nombre: 'cert_1.p12',
    certificado_password_encrypted: 'encrypted_pass',
    certificado_valido_hasta: new Date('2030-01-01'),
    certificado_sujeto: 'CN=Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmisoresService,
        {
          provide: EmisorRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByRuc: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            ensureBucketForRuc: jest.fn(),
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: XmlSignerService,
          useValue: {
            clearEmisorCache: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmisoresService>(EmisoresService);
    repository = module.get(EmisorRepository);
    encryptionService = module.get(EncryptionService);
    storageService = module.get(StorageService);
    xmlSignerService = module.get(XmlSignerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadCertificado', () => {
    it('throws NotFoundException if emisor does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.uploadCertificado(999, Buffer.from('test'), 'pass'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if P12 file processing fails', async () => {
      repository.findById.mockResolvedValue(mockEmisorRecord);

      await expect(
        service.uploadCertificado(1, Buffer.from('invalid p12'), 'pass'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCertificado', () => {
    it('throws NotFoundException if emisor does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteCertificado(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes cert file from storage and clears metadata and cache', async () => {
      repository.findById.mockResolvedValue(mockEmisorRecord);
      storageService.ensureBucketForRuc.mockResolvedValue('bucket-certs');
      repository.update.mockResolvedValue({
        ...mockEmisorRecord,
        certificado_nombre: undefined,
        certificado_password_encrypted: undefined,
        certificado_valido_hasta: undefined,
        certificado_sujeto: undefined,
      });

      const result = await service.deleteCertificado(1);

      expect(storageService.ensureBucketForRuc).toHaveBeenCalledWith(
        '1790012345001',
        'certs',
      );
      expect(storageService.delete).toHaveBeenCalledWith(
        'bucket-certs',
        'cert_1.p12',
      );
      expect(repository.update).toHaveBeenCalledWith(1, {
        certificado_nombre: null,
        certificado_password_encrypted: null,
        certificado_valido_hasta: null,
        certificado_sujeto: null,
      });
      expect(xmlSignerService.clearEmisorCache).toHaveBeenCalledWith(
        '1790012345001',
      );
      expect(result.tieneCertificado).toBe(false);
    });
  });
});
