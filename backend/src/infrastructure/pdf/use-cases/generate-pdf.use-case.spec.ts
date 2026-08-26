jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GeneratePdfUseCase } from './generate-pdf.use-case';
import { PdfService } from '../pdf.service';
import type { PdfDocumentType } from '../document-type.interface';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';

const mockDocumentType: PdfDocumentType = {
  type: 'test-doc',
  name: 'Test Document',
  template: 'test-template',
  adaptData: jest.fn((raw) => ({ adapted: raw })),
};

describe('GeneratePdfUseCase', () => {
  let useCase: GeneratePdfUseCase;

  const mockPdfService = {
    getDocumentType: jest.fn(),
    getAvailableTypes: jest.fn(),
    render: jest.fn(),
    registerDocumentType: jest.fn(),
  };
  const institutional = {
    institucion: { version: 'test-v1' },
    metadatosDocumento: {
      perfilInstitucional: { version: 'test-v1' },
    },
  };
  const mockInstitutionalProfiles = {
    resolve: jest.fn().mockResolvedValue(institutional),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratePdfUseCase,
        { provide: PdfService, useValue: mockPdfService },
        {
          provide: InstitutionalProfileResolver,
          useValue: mockInstitutionalProfiles,
        },
      ],
    }).compile();

    useCase = module.get<GeneratePdfUseCase>(GeneratePdfUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when type is not registered', async () => {
      mockPdfService.getDocumentType.mockReturnValue(undefined);
      mockPdfService.getAvailableTypes.mockReturnValue(['other-type']);

      await expect(useCase.execute('unknown-type', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call adaptData with raw data', async () => {
      const raw = { field: 'value' };
      const pdfBuffer = Buffer.from('pdf-content');
      mockPdfService.getDocumentType.mockReturnValue(mockDocumentType);
      mockPdfService.render.mockResolvedValue(pdfBuffer);

      await useCase.execute('test-doc', raw);

      expect(mockDocumentType.adaptData).toHaveBeenCalledWith(raw);
    });

    it('should call render with template name and adapted data', async () => {
      const raw = { field: 'value' };
      const adapted = { adapted: raw };
      const pdfBuffer = Buffer.from('pdf-content');
      mockPdfService.getDocumentType.mockReturnValue(mockDocumentType);
      mockPdfService.render.mockResolvedValue(pdfBuffer);

      await useCase.execute('test-doc', raw);

      expect(mockPdfService.render).toHaveBeenCalledWith(
        'test-template',
        { ...adapted, ...institutional },
        { documentType: 'test-doc' },
      );
    });

    it('should return the Buffer from render', async () => {
      const pdfBuffer = Buffer.from('pdf-content');
      mockPdfService.getDocumentType.mockReturnValue(mockDocumentType);
      mockPdfService.render.mockResolvedValue(pdfBuffer);

      const result = await useCase.execute('test-doc', {});

      expect(result).toBe(pdfBuffer);
    });

    it('should include available types in NotFoundException message', async () => {
      mockPdfService.getDocumentType.mockReturnValue(undefined);
      mockPdfService.getAvailableTypes.mockReturnValue(['type-a', 'type-b']);

      await expect(useCase.execute('missing', {})).rejects.toThrow(
        "PDF type 'missing' not registered. Available: type-a, type-b",
      );
    });

    it('should fail explicitly when document requires institutional profile and resolution fails', async () => {
      const raw = { field: 'value' };
      mockPdfService.getDocumentType.mockReturnValue(mockDocumentType);
      mockInstitutionalProfiles.resolve.mockRejectedValueOnce(
        new NotFoundException(
          'No active emisor or institutional profile found',
        ),
      );

      await expect(useCase.execute('test-doc', raw)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPdfService.render).not.toHaveBeenCalled();
    });

    it('should skip institutional profile resolution when document type specifies requiresInstitutionalProfile: false', async () => {
      const docTypeWithoutProfile: PdfDocumentType = {
        type: 'sri-doc',
        name: 'SRI Document',
        template: 'sri-template',
        requiresInstitutionalProfile: false,
        adaptData: jest.fn((raw) => ({ adaptedSri: raw })),
      };
      const raw = { emisor: { ruc: '123' } };
      const pdfBuffer = Buffer.from('sri-pdf');
      mockPdfService.getDocumentType.mockReturnValue(docTypeWithoutProfile);
      mockPdfService.render.mockResolvedValue(pdfBuffer);

      const result = await useCase.execute('sri-doc', raw);

      expect(result).toBe(pdfBuffer);
      expect(mockInstitutionalProfiles.resolve).not.toHaveBeenCalled();
      expect(mockPdfService.render).toHaveBeenCalledWith(
        'sri-template',
        { adaptedSri: raw },
        { documentType: 'sri-doc' },
      );
    });
  });
});
