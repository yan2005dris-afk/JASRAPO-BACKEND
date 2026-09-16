import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EmisoresService } from './emisores.service';
import { EmisorRepository } from '../domain/repositories/emisor.repository';
import { EncryptionService } from '../../../infrastructure/encryption/encryption.service';
import { StorageService } from '../../../infrastructure/storage/storage.service';
import { XmlSignerService } from '../../emision/infrastructure/xml/xml-signer.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import type { EmisorRecord } from '../../domain/interfaces/repository.interface';
import type { CreateEmisorDto, UpdateEmisorDto } from '../interfaces/dto';

describe('EmisoresService', () => {
  let service: EmisoresService;
  let repository: jest.Mocked<EmisorRepository>;
  let encryptionService: jest.Mocked<EncryptionService>;
  let storageService: jest.Mocked<StorageService>;
  let xmlSignerService: jest.Mocked<XmlSignerService>;

  const mockEmisorRecord: EmisorRecord = {
    id: 1,
    ruc: '1790012345001',
    razon_social: 'EMPRESA PRUEBA S.A.',
    nombre_comercial: 'MI EMPRESA',
    direccion_matriz: 'Av. Principal 123',
    obligado_contabilidad: true,
    contribuyente_rimpe: false,
    ambiente: '1',
    estado: 'ACTIVO',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<EmisorRepository>> = {
      findAll: jest.fn().mockResolvedValue([mockEmisorRecord]),
      findById: jest.fn().mockImplementation((id: number) => {
        if (id === 1) return Promise.resolve(mockEmisorRecord);
        return Promise.resolve(null);
      }),
      findByRuc: jest.fn().mockImplementation((ruc: string) => {
        if (ruc === '1790012345001') return Promise.resolve(mockEmisorRecord);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((data: any) =>
        Promise.resolve({
          ...mockEmisorRecord,
          ...data,
          id: 2,
        }),
      ),
      update: jest.fn().mockImplementation((id: number, data: any) =>
        Promise.resolve({
          ...mockEmisorRecord,
          ...data,
          id,
        }),
      ),
    };

    const mockEncryption = {
      encrypt: jest.fn().mockResolvedValue('encrypted_pass'),
      decrypt: jest.fn().mockResolvedValue('plain_pass'),
    };

    const mockStorage = {
      ensureBucketForRuc: jest.fn().mockResolvedValue('sri-certs'),
      upload: jest.fn().mockResolvedValue('cert_1.p12'),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const mockXmlSigner = {
      clearEmisorCache: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmisoresService,
        { provide: EmisorRepository, useValue: mockRepo },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: StorageService, useValue: mockStorage },
        { provide: XmlSignerService, useValue: mockXmlSigner },
        { provide: LoggerService, useValue: mockLogger },
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

  describe('findAll', () => {
    it('should return mapped array of EmisorResponseDto', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].ruc).toBe('1790012345001');
      expect(result[0].razonSocial).toBe('EMPRESA PRUEBA S.A.');
    });
  });

  describe('findOne', () => {
    it('should return emisor when ID exists', async () => {
      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.ruc).toBe('1790012345001');
    });

    it('should throw EntityNotFoundException when ID does not exist', async () => {
      await expect(service.findOne(999)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('validateRucAccess', () => {
    it('should return emisor when RUC exists', async () => {
      const result = await service.validateRucAccess('1790012345001');
      expect(result.ruc).toBe('1790012345001');
    });

    it('should throw EntityNotFoundException when RUC does not exist', async () => {
      await expect(service.validateRucAccess('9999999999001')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create an emisor successfully', async () => {
      const dto: CreateEmisorDto = {
        ruc: '0999999999001',
        razonSocial: 'NUEVA EMPRESA S.A.',
        direccionMatriz: 'Calle Nueva 456',
        obligadoContabilidad: true,
      };

      const result = await service.create(dto);
      expect(result.ruc).toBe('0999999999001');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw EntityAlreadyExistsException if RUC is already registered', async () => {
      const dto: CreateEmisorDto = {
        ruc: '1790012345001',
        razonSocial: 'DUPLICADO S.A.',
        direccionMatriz: 'Calle 1',
      };

      await expect(service.create(dto)).rejects.toThrow(
        EntityAlreadyExistsException,
      );
    });
  });

  describe('update', () => {
    it('should update emisor fields successfully', async () => {
      const dto: UpdateEmisorDto = {
        razonSocial: 'EMPRESA ACTUALIZADA S.A.',
      };

      const result = await service.update(1, dto);
      expect(result.razonSocial).toBe('EMPRESA ACTUALIZADA S.A.');
    });

    it('should throw EntityNotFoundException when updating non-existent emisor', async () => {
      await expect(
        service.update(999, { razonSocial: 'TEST' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('delete', () => {
    it('should inactivate an active emisor', async () => {
      const result = await service.delete(1);
      expect(result.estado).toBe('INACTIVO');
      expect(repository.update).toHaveBeenCalledWith(1, { estado: 'INACTIVO' });
    });

    it('should throw InvalidDomainOperationException if emisor is already INACTIVO', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce({
        ...mockEmisorRecord,
        estado: 'INACTIVO',
      });

      await expect(service.delete(1)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });
  });

  describe('uploadCertificado', () => {
    it('stores the certificate and clears the signer cache', async () => {
      jest.spyOn(service as any, 'extractCertificateInfo').mockReturnValue({
        validoHasta: new Date('2030-01-01T00:00:00.000Z'),
        sujeto: 'CN=JASRAPO',
      });

      const result = await service.uploadCertificado(
        1,
        Buffer.from('certificate'),
        'secret',
      );

      expect(storageService.upload).toHaveBeenCalledWith(
        'sri-certs',
        'cert_1.p12',
        Buffer.from('certificate'),
        { contentType: 'application/x-pkcs12' },
      );
      expect(encryptionService.encrypt).toHaveBeenCalledWith('secret');
      expect(repository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          certificado_nombre: 'cert_1.p12',
          certificado_sujeto: 'CN=JASRAPO',
        }),
      );
      expect(xmlSignerService.clearEmisorCache).toHaveBeenCalledWith(
        mockEmisorRecord.ruc,
      );
      expect(result.tieneCertificado).toBe(true);
    });
  });

  describe('deleteCertificado', () => {
    it('should clear certificate metadata and call xmlSignerService.clearEmisorCache', async () => {
      const emisorWithCert: EmisorRecord = {
        ...mockEmisorRecord,
        certificado_nombre: 'cert_1.p12',
      };
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(emisorWithCert);

      await service.deleteCertificado(1);

      expect(storageService.delete).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          certificado_nombre: null,
          certificado_password_encrypted: null,
        }),
      );
      expect(xmlSignerService.clearEmisorCache).toHaveBeenCalledWith(
        mockEmisorRecord.ruc,
      );
    });
  });
});
