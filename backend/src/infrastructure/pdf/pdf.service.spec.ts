import * as fs from 'node:fs';
import Handlebars from 'handlebars';
import { PdfService } from './pdf.service';
import puppeteer from 'puppeteer';
import { mockBrowser, mockPage } from '../../__mocks__/puppeteer';
import {
  PdfGenerationTimeoutException,
  PdfQueueSaturatedException,
  PdfRequestCancelledException,
} from './pdf.exceptions';

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
    mockBrowser.connected = true;
    mockBrowser.newPage.mockResolvedValue(mockPage);
    mockPage.setContent.mockResolvedValue(undefined);
    mockPage.pdf.mockResolvedValue(Buffer.from('%PDF-1.4 mock page pdf'));
    mockPage.close.mockResolvedValue(undefined);
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

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
    it('rejects duplicate document type registrations', () => {
      expect(() =>
        service.registerDocumentType({
          type: 'payments-report-modern',
          name: 'duplicate',
          template: 'payments-report-modern',
          adaptData: (raw: Record<string, unknown>) => raw,
        }),
      ).toThrow(/already registered/);
    });

    it('fails bootstrap when a registered template is missing', async () => {
      (fsMock.existsSync as jest.Mock).mockImplementation((filePath) =>
        String(filePath).endsWith('payments-report-modern.hbs') ? false : true,
      );

      await expect(service.onApplicationBootstrap()).rejects.toThrow(
        /Registered template not found/,
      );
    });

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
  describe('semaphore - Puppeteer concurrency', () => {
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

  describe('PDF-05 operational contract', () => {
    const runtimeOptions = (
      overrides: Partial<{
        concurrency: number;
        maxQueueSize: number;
        totalTimeoutMs: number;
        retryAfterSeconds: number;
      }> = {},
    ) => ({
      concurrency: 1,
      maxQueueSize: 1,
      totalTimeoutMs: 1_000,
      retryAfterSeconds: 5,
      ...overrides,
    });

    const deferred = <T>() => {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    const buildOperationalService = async (
      options = runtimeOptions(),
    ): Promise<PdfService> => {
      const operationalService = new PdfService(options);
      operationalService.registerDocumentType({
        type: 'test-report',
        name: 'test-report',
        template: 'test-report',
        adaptData: (raw) => raw,
      });
      await operationalService.onApplicationBootstrap();
      return operationalService;
    };

    const nextTurn = () =>
      new Promise<void>((resolve) => setImmediate(resolve));

    it('pdfQueueAppliesBoundedBackpressure', async () => {
      const gate = deferred<Buffer>();
      mockPage.pdf.mockImplementation(() => gate.promise);
      const operationalService = await buildOperationalService();

      const active = operationalService.render('test-report', { request: 1 });
      await nextTurn();
      const queued = operationalService.render('test-report', { request: 2 });
      const rejected = operationalService.render('test-report', { request: 3 });

      await expect(rejected).rejects.toThrow(PdfQueueSaturatedException);
      expect(operationalService.getHealthStatus().semaphore.queueLength).toBe(
        1,
      );

      gate.resolve(Buffer.from('pdf'));
      await expect(active).resolves.toBeInstanceOf(Buffer);
      await expect(queued).resolves.toBeInstanceOf(Buffer);
    });

    it('pdfTimeoutIncludesQueueWait', async () => {
      const gate = deferred<Buffer>();
      mockPage.pdf.mockImplementation(() => gate.promise);
      const operationalService = await buildOperationalService();

      const active = operationalService.render(
        'test-report',
        { request: 1 },
        { timeoutMs: 500 },
      );
      await nextTurn();
      const queued = operationalService.render(
        'test-report',
        { request: 2 },
        { timeoutMs: 20 },
      );

      await expect(queued).rejects.toThrow(PdfGenerationTimeoutException);
      gate.resolve(Buffer.from('pdf'));
      await expect(active).resolves.toBeInstanceOf(Buffer);
    });

    it('cancelledPdfRequestIsSafelyAbandoned', async () => {
      const gate = deferred<Buffer>();
      mockPage.pdf.mockImplementation(() => gate.promise);
      const operationalService = await buildOperationalService();
      const abortController = new AbortController();

      const render = operationalService.render(
        'test-report',
        { request: 1 },
        { signal: abortController.signal },
      );
      await nextTurn();
      abortController.abort();

      await expect(render).rejects.toThrow(PdfRequestCancelledException);
      gate.resolve(Buffer.from('late-pdf'));
      await nextTurn();
      expect(mockPage.close).toHaveBeenCalled();
      expect(operationalService.getHealthStatus().metrics.totalRenders).toBe(0);
    });

    it('browserRelaunchIsSingleFlight', async () => {
      const operationalService = new PdfService(runtimeOptions());
      await operationalService.onApplicationBootstrap();

      mockBrowser.connected = false;
      operationalService.markBrowserUnavailable();
      const recoveredBrowser = { ...mockBrowser, connected: true };
      const launchGate = deferred<typeof recoveredBrowser>();
      (puppeteer.launch as jest.Mock).mockReturnValueOnce(launchGate.promise);
      const browserAccess = operationalService as unknown as {
        getBrowser(): Promise<typeof recoveredBrowser>;
      };

      const first = browserAccess.getBrowser();
      const second = browserAccess.getBrowser();
      await nextTurn();
      expect(puppeteer.launch).toHaveBeenCalledTimes(2);

      launchGate.resolve(recoveredBrowser);
      await Promise.all([first, second]);
      expect(operationalService.getHealthStatus().metrics.browserRestarts).toBe(
        1,
      );
    });

    it('pdfGenerationLoadProfileMeetsAgreedThresholds', async () => {
      let activeRenders = 0;
      let maximumActiveRenders = 0;
      mockPage.pdf.mockImplementation(async () => {
        activeRenders++;
        maximumActiveRenders = Math.max(maximumActiveRenders, activeRenders);
        await new Promise<void>((resolve) => setTimeout(resolve, 2));
        activeRenders--;
        return Buffer.from('pdf');
      });
      const operationalService = await buildOperationalService(
        runtimeOptions({ concurrency: 4, maxQueueSize: 12 }),
      );
      const startedAt = Date.now();

      const results = await Promise.all(
        Array.from({ length: 16 }, (_, request) =>
          operationalService.render('test-report', { request }),
        ),
      );

      expect(results).toHaveLength(16);
      expect(maximumActiveRenders).toBeLessThanOrEqual(4);
      expect(Date.now() - startedAt).toBeLessThan(5_000);
      expect(operationalService.getHealthStatus().metrics.totalRejections).toBe(
        0,
      );
    });

    it('boundedPdfQueueSurvivesLoadAndRecovers', async () => {
      const gate = deferred<Buffer>();
      mockPage.pdf.mockImplementation(() => gate.promise);
      const operationalService = await buildOperationalService();

      const active = operationalService.render('test-report', { request: 1 });
      await nextTurn();
      const queued = operationalService.render('test-report', { request: 2 });
      const rejected = operationalService.render('test-report', { request: 3 });

      await expect(rejected).rejects.toThrow(PdfQueueSaturatedException);
      gate.resolve(Buffer.from('pdf'));
      await Promise.all([active, queued]);
      await nextTurn();

      mockPage.pdf.mockResolvedValue(Buffer.from('recovered-pdf'));
      await expect(
        operationalService.render('test-report', { request: 4 }),
      ).resolves.toEqual(Buffer.from('recovered-pdf'));

      expect(operationalService.getHealthStatus()).toEqual(
        expect.objectContaining({
          semaphore: expect.objectContaining({
            activeSlots: 0,
            queueLength: 0,
          }),
          metrics: expect.objectContaining({
            totalRenders: 3,
            totalRejections: 1,
          }),
        }),
      );
    });
  });
});
