import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReportStyleDispatcher } from './report-style.dispatcher';
import type { ReportKey, ReportStyle } from './report-style.service';
import { ReportStyleService } from './report-style.service';
import { PdfService } from '../../infrastructure/pdf/pdf.service';
import { buildPdfFileName } from '../../infrastructure/pdf/utils/pdf-format.utils';
import type { PdfDocumentType } from '../../infrastructure/pdf/document-type.interface';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

jest.mock('../../infrastructure/pdf/utils/pdf-format.utils', () => ({
  buildPdfFileName: jest.fn(
    (reportKey: string, hash?: string) => `${reportKey}-${hash ?? 'auto'}.pdf`,
  ),
}));

const buildPdfFileNameMock = buildPdfFileName as jest.Mock;

describe('ReportStyleDispatcher', () => {
  let dispatcher: ReportStyleDispatcher;
  let styles: jest.Mocked<ReportStyleService>;
  let pdfService: jest.Mocked<PdfService>;
  let loggerWarnSpy: jest.SpyInstance;

  const buildDocType = (
    type: string,
    template: string,
    name: string,
  ): PdfDocumentType => ({
    type,
    name,
    template,
    adaptData: jest.fn((raw: object) => ({
      ...raw,
      adaptedBy: template,
    })),
  });

  const makeDocTypes = () => ({
    'payments-report-legacy': buildDocType(
      'payments-report-legacy',
      'payments-report-legacy',
      'Reporte de Abonos (Legacy)',
    ),
    'payments-report-modern': buildDocType(
      'payments-report-modern',
      'payments-report-modern',
      'Reporte de Abonos (Moderno)',
    ),
    'connection-history-legacy': buildDocType(
      'connection-history-legacy',
      'connection-history-legacy',
      'Historial de Conexión (Legacy)',
    ),
    'connection-history-modern': buildDocType(
      'connection-history-modern',
      'connection-history-modern',
      'Historial de Conexión (Moderno)',
    ),
    'payment-agreement': buildDocType(
      'payment-agreement',
      'payment-agreement',
      'Convenio de Pago',
    ),
  });

  const docTypes = makeDocTypes();
  const documentTypeMap = new Map<string, PdfDocumentType>(
    Object.entries(docTypes),
  );
  const fakeBuffer = Buffer.from('%PDF-1.4 fake');

  const mockStyleService = {
    resolveStyle: jest.fn(),
  };

  const mockPdfService = {
    getDocumentType: jest.fn((type: string) => documentTypeMap.get(type)),
    getAvailableTypes: jest.fn(() => Array.from(documentTypeMap.keys())),
    render: jest.fn(async () => fakeBuffer),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        ReportStyleDispatcher,
        { provide: ReportStyleService, useValue: mockStyleService },
        { provide: PdfService, useValue: mockPdfService },
      ],
    }).compile();

    dispatcher = module.get<ReportStyleDispatcher>(ReportStyleDispatcher);
    styles = module.get(ReportStyleService);
    pdfService = module.get(PdfService);

    loggerWarnSpy = jest
      .spyOn(mockLogger, 'warn')
      .mockImplementation(() => undefined);

    buildPdfFileNameMock.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    buildPdfFileNameMock.mockClear();
  });

  it('should be defined', () => {
    expect(dispatcher).toBeDefined();
  });

  describe('dispatch — composite-key routing', () => {
    it.each<[ReportKey, ReportStyle, keyof typeof docTypes]>([
      ['payments-report', 'legacy', 'payments-report-legacy'],
      ['payments-report', 'modern', 'payments-report-modern'],
      ['connection-history', 'legacy', 'connection-history-legacy'],
      ['connection-history', 'modern', 'connection-history-modern'],
    ])(
      'routes %s + %s to pdf-type %s',
      async (reportKey, style, expectedType) => {
        mockStyleService.resolveStyle.mockResolvedValueOnce(style);

        await dispatcher.dispatch(reportKey, { foo: 'bar' } as never);

        expect(mockStyleService.resolveStyle).toHaveBeenCalledWith(reportKey);
        expect(mockPdfService.getDocumentType).toHaveBeenCalledWith(
          expectedType,
        );
        expect(mockPdfService.render).toHaveBeenCalledWith(
          expectedType,
          expect.objectContaining({ adaptedBy: expectedType, foo: 'bar' }),
          expect.objectContaining({ documentType: reportKey }),
        );
      },
    );
  });

  describe('dispatch — canonical-only (unique) routing', () => {
    it('routes payment-agreement to its canonical type and ignores the global style config', async () => {
      // A canonical-only report must never read the global `reporte.estilo`
      // and must render the single official template. We intentionally do NOT
      // queue a resolveStyle value: the dispatcher must not consume it.
      await dispatcher.dispatch('payment-agreement', { foo: 'bar' } as never);

      expect(mockStyleService.resolveStyle).not.toHaveBeenCalled();
      expect(mockPdfService.getDocumentType).toHaveBeenCalledWith(
        'payment-agreement',
      );
      expect(mockPdfService.render).toHaveBeenCalledWith(
        'payment-agreement',
        expect.objectContaining({ adaptedBy: 'payment-agreement' }),
        expect.objectContaining({ documentType: 'payment-agreement' }),
      );
    });
  });

  describe('dispatch — return value', () => {
    it('returns the PDF buffer and a deterministic filename', async () => {
      mockStyleService.resolveStyle.mockResolvedValueOnce('modern');

      const result = await dispatcher.dispatch('payments-report', {
        ok: 1,
      } as never);

      expect(result.buffer).toBe(fakeBuffer);
      expect(result.filename).toBe('payments-report-auto.pdf');
      expect(buildPdfFileNameMock).toHaveBeenCalledTimes(1);
      expect(buildPdfFileNameMock).toHaveBeenCalledWith(
        'payments-report',
        undefined,
      );
    });

    it('forwards the explicit hash when provided', async () => {
      mockStyleService.resolveStyle.mockResolvedValueOnce('legacy');

      await dispatcher.dispatch('connection-history', {} as never, 'deadbeef');

      expect(buildPdfFileNameMock).toHaveBeenCalledWith(
        'connection-history',
        'deadbeef',
      );
    });
  });

  describe('dispatch — adaptData', () => {
    it('invokes the matched pdf-type adaptData before rendering', async () => {
      mockStyleService.resolveStyle.mockResolvedValueOnce('modern');
      const modernType = docTypes['payments-report-modern'];

      await dispatcher.dispatch('payments-report', { raw: true } as never);

      expect(modernType.adaptData).toHaveBeenCalledWith({ raw: true });
      const renderMock = mockPdfService.render as jest.Mock;
      const renderCall = renderMock.mock.calls[0] as unknown as
        | [string, Record<string, unknown>]
        | undefined;
      expect(renderCall?.[1]['adaptedBy']).toBe('payments-report-modern');
    });
  });

  describe('dispatch — invalid style', () => {
    it('forces legacy when an invalid style sneaks past the service', async () => {
      // Simulate a corrupted cache entry: resolveStyle has a `ReportStyle`
      // return type so it cannot actually return garbage, but the
      // dispatcher re-validates as belt-and-suspenders (REQ-16).
      mockStyleService.resolveStyle.mockResolvedValueOnce('midnight');

      const result = await dispatcher.dispatch('payments-report', {} as never);

      expect(result.filename).toBe('payments-report-auto.pdf');
      expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid style'),
      );
      expect(mockPdfService.getDocumentType).toHaveBeenCalledWith(
        'payments-report-legacy',
      );
    });
  });

  describe('dispatch — unknown composite key', () => {
    it('throws NotFoundException when the resolved pdf-type is missing', async () => {
      mockStyleService.resolveStyle.mockResolvedValueOnce('modern');
      mockPdfService.getDocumentType.mockReturnValueOnce(undefined);

      await expect(
        dispatcher.dispatch('payments-report', {} as never),
      ).rejects.toThrow(/payments-report-modern/);
    });
  });
});
