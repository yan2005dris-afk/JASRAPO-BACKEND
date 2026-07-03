import * as fs from 'node:fs';
import Handlebars from 'handlebars';
import { PdfService } from './pdf.service';

jest.mock('node:fs');

describe('PdfService', () => {
  let service: PdfService;
  const fsMock = fs as jest.Mocked<typeof fs>;
  let compileSpy: jest.SpyInstance;
  let registerPartialSpy: jest.SpyInstance;

  const fakeHtmlContent = '<html>{{title}}</html>';
  const fakeStylesContent = '<style>:root {}</style>';
  const fakeModernStylesContent =
    '<style>:root { --primary: green; --brand-dark: #166534; }</style>';

  beforeAll(() => {
    // Spies wrap the real Handlebars methods — they pass through to the original
    // but track call count and arguments.
    compileSpy = jest.spyOn(Handlebars, 'compile');
    registerPartialSpy = jest.spyOn(Handlebars, 'registerPartial');
  });

  afterAll(() => {
    compileSpy.mockRestore();
    registerPartialSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default fs mocks: styles.hbs, modern-styles.hbs, and template files exist
    (fsMock.existsSync as jest.Mock).mockReturnValue(true);
    (fsMock.readFileSync as jest.Mock).mockImplementation(
      (filePath: string | Buffer) => {
        const p = String(filePath);
        if (p.endsWith('styles.hbs')) return fakeStylesContent;
        if (p.endsWith('modern-styles.hbs')) return fakeModernStylesContent;
        return fakeHtmlContent;
      },
    );

    service = new PdfService();

    // Register a doc type so bootstrap has something to compile
    service.registerDocumentType({
      type: 'payments-report-modern',
      name: 'payments-report-modern',
      template: 'payments-report-modern',
      adaptData: (raw: Record<string, unknown>) => ({ ...raw }),
    });
  });

  // ---------------------------------------------------------------------------
  // Bootstrap — template pre-compilation (REQ-23)
  // ---------------------------------------------------------------------------
  describe('onApplicationBootstrap — template cache', () => {
    it('compiles templates for every registered pdf-type', async () => {
      compileSpy.mockClear();

      await service.onApplicationBootstrap();

      // bootstrap compiles payments-report-modern
      expect(compileSpy).toHaveBeenCalledWith(fakeHtmlContent);
    });

    it('populates the cache so render does not call compile again', async () => {
      compileSpy.mockClear();

      await service.onApplicationBootstrap();
      const buffer = await service.render('payments-report-modern', {
        title: 'Test',
      });

      expect(buffer).toBeInstanceOf(Buffer);
      // compile was called during bootstrap — but NOT during render
      expect(compileSpy).toHaveBeenCalledTimes(1); // bootstrap only
    });

    it('renders an uncached template by compiling on demand', async () => {
      compileSpy.mockClear();

      await service.onApplicationBootstrap();
      compileSpy.mockClear();

      // Render an uncached template — should compile on demand
      const unknownSrc = '<html>{{fallback}}</html>';
      (fsMock.readFileSync as jest.Mock).mockReturnValueOnce(unknownSrc);

      const buffer = await service.render('unknown-template', {
        fallback: 'hello',
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(compileSpy).toHaveBeenCalledTimes(1);
      expect(compileSpy).toHaveBeenCalledWith(unknownSrc);
    });

    it('throws NotFoundException when template file does not exist', async () => {
      (fsMock.existsSync as jest.Mock).mockReturnValueOnce(false);

      await expect(service.render('non-existent', {})).rejects.toThrow(
        /Template not found/,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // modern-styles partial registration (REQ-29)
  // ---------------------------------------------------------------------------
  describe('modern-styles partial', () => {
    it('registers the modern-styles partial alongside styles', async () => {
      registerPartialSpy.mockClear();

      await service.onApplicationBootstrap();

      expect(registerPartialSpy).toHaveBeenCalledWith(
        'styles',
        expect.any(String),
      );
      expect(registerPartialSpy).toHaveBeenCalledWith(
        'modern-styles',
        expect.any(String),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Puppeteer concurrency semaphore (REQ-24, REQ-25)
  // ---------------------------------------------------------------------------
  describe('semaphore — Puppeteer concurrency', () => {
    beforeEach(async () => {
      compileSpy.mockClear();
      registerPartialSpy.mockClear();

      await service.onApplicationBootstrap();
    });

    it('renders a PDF successfully under serial calls', async () => {
      const buffer = await service.render('payments-report-modern', {
        title: 'Hello',
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('renders 8 concurrent requests with all completing successfully', async () => {
      const renders = Array.from({ length: 8 }, (_, i) =>
        service.render('payments-report-modern', { title: `Req ${i}` }),
      );

      const results = await Promise.all(renders);
      expect(results).toHaveLength(8);
      results.forEach((buf) => {
        expect(buf).toBeInstanceOf(Buffer);
        expect(buf.length).toBeGreaterThan(0);
      });
    });
  });
});
