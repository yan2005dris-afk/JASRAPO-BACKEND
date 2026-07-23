import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import {
  EmisoresController,
  createP12FileFilter,
  P12_UPLOAD_OPTIONS,
} from './emisores.controller';
import { EmisoresService } from '../../application/emisores.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';

describe('EmisoresController', () => {
  let controller: EmisoresController;
  let emisoresService: EmisoresService;

  const mockEmisorResponse = {
    id: '1',
    ruc: '1790012345001',
    razonSocial: 'Empresa Test',
    direccionMatriz: 'Av. Siempre Viva 123',
    obligadoContabilidad: false,
    contribuyenteRimpe: false,
    ambiente: '1',
    estado: 'ACTIVO',
    tieneCertificado: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmisoresController],
      providers: [
        {
          provide: EmisoresService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            uploadCertificado: jest.fn(),
            deleteCertificado: jest.fn(),
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

    controller = module.get<EmisoresController>(EmisoresController);
    emisoresService = module.get<EmisoresService>(EmisoresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCertificado', () => {
    const mockFile = {
      buffer: Buffer.from('fake-p12-content'),
      originalname: 'certificado.p12',
      mimetype: 'application/x-pkcs12',
      size: 1024,
    } as Express.Multer.File;

    it('calls emisoresService.uploadCertificado with id, buffer and password', async () => {
      jest
        .spyOn(emisoresService, 'uploadCertificado')
        .mockResolvedValue(mockEmisorResponse);

      const result = await controller.uploadCertificado(
        1,
        { password: 'secret123' },
        mockFile,
      );

      expect(emisoresService.uploadCertificado).toHaveBeenCalledWith(
        1,
        mockFile.buffer,
        'secret123',
      );
      expect(result).toEqual(mockEmisorResponse);
    });

    it('throws BadRequestException when no file is attached', async () => {
      await expect(
        controller.uploadCertificado(1, { password: 'secret123' }, undefined),
      ).rejects.toThrow(BadRequestException);

      expect(emisoresService.uploadCertificado).not.toHaveBeenCalled();
    });
  });

  describe('deleteCertificado', () => {
    it('calls emisoresService.deleteCertificado with id', async () => {
      jest.spyOn(emisoresService, 'deleteCertificado').mockResolvedValue({
        ...mockEmisorResponse,
        tieneCertificado: false,
      });

      const result = await controller.deleteCertificado(1);

      expect(emisoresService.deleteCertificado).toHaveBeenCalledWith(1);
      expect(result.tieneCertificado).toBe(false);
    });
  });

  describe('createP12FileFilter', () => {
    const runFilter = (
      file: Partial<Express.Multer.File>,
    ): Promise<{ error: Error | null; accepted: boolean }> => {
      const filter = createP12FileFilter();
      return new Promise((resolve) => {
        filter({}, file as Express.Multer.File, (error, acceptFile) => {
          resolve({ error, accepted: acceptFile });
        });
      });
    };

    it('accepts a file with .p12 extension', async () => {
      const { error, accepted } = await runFilter({
        originalname: 'certificado.p12',
        mimetype: 'application/octet-stream',
      });

      expect(error).toBeNull();
      expect(accepted).toBe(true);
    });

    it('accepts a file with application/x-pkcs12 mimetype regardless of extension casing', async () => {
      const { error, accepted } = await runFilter({
        originalname: 'CERTIFICADO.P12',
        mimetype: 'application/x-pkcs12',
      });

      expect(error).toBeNull();
      expect(accepted).toBe(true);
    });

    it('rejects a non-.p12 file with an unrelated mimetype', async () => {
      const { error, accepted } = await runFilter({
        originalname: 'documento.pdf',
        mimetype: 'application/pdf',
      });

      expect(error).toBeInstanceOf(BadRequestException);
      expect(accepted).toBe(false);
    });

    it('rejects a file disguised with a .txt extension', async () => {
      const { error, accepted } = await runFilter({
        originalname: 'certificado.txt',
        mimetype: 'text/plain',
      });

      expect(error).toBeInstanceOf(BadRequestException);
      expect(accepted).toBe(false);
    });
  });

  describe('P12_UPLOAD_OPTIONS', () => {
    it('wires the Multer fileSize limit to MAX_UPLOAD_SIZE_BYTES so oversized files are rejected', () => {
      expect(P12_UPLOAD_OPTIONS.limits.fileSize).toBe(MAX_UPLOAD_SIZE_BYTES);
    });
  });
});
