import {
  ConflictException,
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Optional,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Liquid, type Template } from 'liquidjs';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { PdfDocumentType } from './document-type.interface';
import { MetricsService } from '../observability/metrics/metrics.service';
import {
  buildPdfRuntimeOptions,
  PDF_RUNTIME_OPTIONS,
  type PdfRuntimeOptions,
} from './pdf-runtime.config';
import {
  PdfGenerationTimeoutException,
  PdfQueueSaturatedException,
  PdfRequestCancelledException,
} from './pdf.exceptions';

export interface PdfRenderOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  documentType?: string;
}

interface SemaphoreTask {
  fn: (signal: AbortSignal) => Promise<Buffer>;
  resolve: (value: Buffer) => void;
  reject: (reason: unknown) => void;
  documentType: string;
  requestedAt: number;
  enqueuedAt: number;
  deadlineAt: number;
  timeoutMs: number;
  abortController: AbortController;
  externalSignal?: AbortSignal;
  externalAbortHandler?: () => void;
  timeoutHandle?: ReturnType<typeof setTimeout>;
  state: 'queued' | 'running' | 'settled';
}

@Injectable()
export class PdfService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PdfService.name);
  private readonly templatesDir: string;
  private readonly engine: Liquid;
  private readonly documentTypes = new Map<
    string,
    PdfDocumentType<never, object>
  >();
  private readonly templateCache = new Map<string, Template[]>();

  browser: Browser | null = null;
  private browserLaunchPromise: Promise<Browser> | null = null;
  private hasLaunchedBrowser = false;
  private browserLaunchTime = 0;

  readonly concurrency: number;
  readonly maxQueueSize: number;
  readonly totalTimeoutMs: number;
  private readonly retryAfterSeconds: number;
  private readonly queue: SemaphoreTask[] = [];
  private activeCount = 0;

  private totalRenders = 0;
  private totalErrors = 0;
  private totalTimeouts = 0;
  private totalRejections = 0;
  private totalCancellations = 0;
  private browserRestarts = 0;
  private lastErrorAt: string | null = null;
  private lastErrorMessage: string | null = null;

  constructor(
    @Optional()
    @Inject(PDF_RUNTIME_OPTIONS)
    runtimeOptions?: PdfRuntimeOptions,
    @Optional() private readonly metrics?: MetricsService,
  ) {
    const options = runtimeOptions ?? buildPdfRuntimeOptions();
    this.concurrency = options.concurrency;
    this.maxQueueSize = options.maxQueueSize;
    this.totalTimeoutMs = options.totalTimeoutMs;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.templatesDir = path.join(__dirname, 'templates');

    const partialsDir = path.join(this.templatesDir, 'partials');
    this.engine = new Liquid({
      root: [this.templatesDir, partialsDir],
      extname: '.liquid',
      dynamicPartials: true,
      strictFilters: false,
      strictVariables: false,
    });

    this.registerLiquidFilters();
  }

  private registerLiquidFilters(): void {
    this.engine.registerFilter('math', (a: number, op: string, b: number) => {
      switch (op) {
        case '+':
          return Number(a) + Number(b);
        case '-':
          return Number(a) - Number(b);
        case '*':
          return Number(a) * Number(b);
        case '/':
          return Number(a) / Number(b);
        default:
          return a;
      }
    });
    this.engine.registerFilter('eq', (a: unknown, b: unknown) => a === b);
    this.engine.registerFilter('ne', (a: unknown, b: unknown) => a !== b);
    this.engine.registerFilter(
      'gt',
      (a: unknown, b: unknown) => Number(a) > Number(b),
    );
    this.engine.registerFilter(
      'gte',
      (a: unknown, b: unknown) => Number(a) >= Number(b),
    );
    this.engine.registerFilter(
      'lt',
      (a: unknown, b: unknown) => Number(a) < Number(b),
    );
    this.engine.registerFilter(
      'lte',
      (a: unknown, b: unknown) => Number(a) <= Number(b),
    );
    this.engine.registerFilter('isEven', (a: unknown) => Number(a) % 2 === 0);
    this.engine.registerFilter('isOdd', (a: unknown) => Number(a) % 2 !== 0);
  }

  /** Concurrent recovery callers await this same launch operation. */
  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;
    if (this.browserLaunchPromise) return this.browserLaunchPromise;

    const isRestart = this.hasLaunchedBrowser;
    const launchPromise = puppeteer.launch({
      headless: true,
      executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    this.browserLaunchPromise = launchPromise;

    try {
      const browser = await launchPromise;
      this.browser = browser;
      this.browserLaunchTime = Date.now();
      this.hasLaunchedBrowser = true;
      if (isRestart) {
        this.browserRestarts++;
        this.metrics?.pdfBrowserRestartsTotal.inc();
      }
      this.logger.log(
        isRestart
          ? 'Puppeteer browser re-launched'
          : 'Puppeteer browser launched',
      );
      return browser;
    } finally {
      if (this.browserLaunchPromise === launchPromise) {
        this.browserLaunchPromise = null;
      }
    }
  }

  markBrowserUnavailable(): void {
    this.browser = null;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Warming up Puppeteer browser...');
    await this.getBrowser();

    const types = this.getAvailableTypes();
    this.logger.log(`Pre-compiling ${types.length} templates...`);
    for (const type of types) {
      const docType = this.documentTypes.get(type);
      if (!docType) continue;
      const templatePath = path.join(
        this.templatesDir,
        `${docType.template}.liquid`,
      );
      if (!fs.existsSync(templatePath)) {
        throw new NotFoundException(
          `Registered template not found: ${docType.template}.liquid`,
        );
      }
      const source = fs.readFileSync(templatePath, 'utf8');
      this.templateCache.set(docType.template, this.engine.parse(source));
    }
    this.logger.log(
      `Template cache populated with ${this.templateCache.size} entries.`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    const browser = this.browser ?? (await this.browserLaunchPromise);
    if (browser?.connected) {
      this.logger.log('Closing Puppeteer browser...');
      await browser.close();
    }
    this.browser = null;
  }

  registerDocumentType<TInput, TOutput extends object>(
    docType: PdfDocumentType<TInput, TOutput>,
  ): void {
    if (this.documentTypes.has(docType.type)) {
      throw new ConflictException(
        `Document type '${docType.type}' is already registered`,
      );
    }
    this.documentTypes.set(docType.type, docType);
    this.logger.log(`Registered PDF type: ${docType.type}`);
  }

  async render(
    templateName: string,
    data: object,
    options: PdfRenderOptions = {},
  ): Promise<Buffer> {
    const requestedAt = Date.now();
    const html = await this.renderHtmlAsync(templateName, data);
    const documentType = options.documentType ?? templateName;
    return this.runWithSemaphore(
      (signal) => this.htmlToPdf(html, signal, documentType),
      {
        documentType,
        requestedAt,
        timeoutMs: options.timeoutMs ?? this.totalTimeoutMs,
        externalSignal: options.signal,
      },
    );
  }

  /** Deterministic Liquid output used by contract and golden tests. */
  renderHtml(templateName: string, data: object): string {
    const templateFile = path.join(this.templatesDir, `${templateName}.liquid`);
    if (!fs.existsSync(templateFile)) {
      throw new NotFoundException(`Template not found: ${templateName}.liquid`);
    }
    return this.renderTemplateSync(templateName, data);
  }

  async renderHtmlAsync(templateName: string, data: object): Promise<string> {
    const templateFile = path.join(this.templatesDir, `${templateName}.liquid`);
    if (!fs.existsSync(templateFile)) {
      throw new NotFoundException(`Template not found: ${templateName}.liquid`);
    }
    return this.renderTemplateAsync(templateName, data);
  }

  private renderTemplateSync(templateName: string, data: object): string {
    let parsed = this.templateCache.get(templateName);
    if (!parsed) {
      const templateFile = path.join(
        this.templatesDir,
        `${templateName}.liquid`,
      );
      const source = fs.readFileSync(templateFile, 'utf8');
      parsed = this.engine.parse(source);
      this.templateCache.set(templateName, parsed);
    }
    return this.engine.renderSync(parsed, data);
  }

  private async renderTemplateAsync(
    templateName: string,
    data: object,
  ): Promise<string> {
    let parsed = this.templateCache.get(templateName);
    if (!parsed) {
      const templateFile = path.join(
        this.templatesDir,
        `${templateName}.liquid`,
      );
      const source = fs.readFileSync(templateFile, 'utf8');
      parsed = this.engine.parse(source);
      this.templateCache.set(templateName, parsed);
    }
    return this.engine.render(parsed, data);
  }

  private async htmlToPdf(
    html: string,
    signal: AbortSignal,
    documentType: string,
  ): Promise<Buffer> {
    const renderStartedAt = Date.now();
    let status = 'success';
    let page: Page | null = null;

    try {
      const browser = await this.raceWithAbort(this.getBrowser(), signal);
      page = await this.raceWithAbort(browser.newPage(), signal);
      await this.raceWithAbort(
        page.setContent(html, { waitUntil: 'load' }),
        signal,
      );
      const pdf = await this.raceWithAbort(
        page.pdf({
          format: 'A4',
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: '<span></span>',
          footerTemplate:
            '<div style="width: 100%; text-align: right; font-size: 9px; padding-right: 15mm; color: #666;">Pág. <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm',
          },
        }),
        signal,
      );
      return Buffer.from(pdf);
    } catch (error) {
      status = this.metricStatus(error);
      if (this.browser && !this.browser.connected) {
        this.markBrowserUnavailable();
      }
      throw error;
    } finally {
      if (page) await page.close().catch(() => undefined);
      this.metrics?.pdfRenderDuration.observe(
        { document_type: documentType, status },
        (Date.now() - renderStartedAt) / 1000,
      );
    }
  }

  private runWithSemaphore(
    fn: (signal: AbortSignal) => Promise<Buffer>,
    admission: {
      documentType: string;
      requestedAt: number;
      timeoutMs: number;
      externalSignal?: AbortSignal;
    },
  ): Promise<Buffer> {
    if (admission.externalSignal?.aborted) {
      const error = new PdfRequestCancelledException();
      this.recordImmediateFailure(
        admission.documentType,
        admission.requestedAt,
        error,
      );
      return Promise.reject(error);
    }

    return new Promise<Buffer>((resolve, reject) => {
      const now = Date.now();
      const task: SemaphoreTask = {
        fn,
        resolve,
        reject,
        documentType: admission.documentType,
        requestedAt: admission.requestedAt,
        enqueuedAt: now,
        deadlineAt: admission.requestedAt + admission.timeoutMs,
        timeoutMs: admission.timeoutMs,
        abortController: new AbortController(),
        externalSignal: admission.externalSignal,
        state: 'queued',
      };

      if (this.activeCount >= this.concurrency) {
        if (this.queue.length >= this.maxQueueSize) {
          const error = new PdfQueueSaturatedException(this.retryAfterSeconds);
          this.recordImmediateFailure(
            task.documentType,
            task.requestedAt,
            error,
          );
          reject(error);
          return;
        }
        this.queue.push(task);
        this.updateCapacityMetrics();
      }

      const remainingMs = task.deadlineAt - Date.now();
      if (remainingMs <= 0) {
        this.abortTask(task, new PdfGenerationTimeoutException(task.timeoutMs));
        return;
      }

      task.timeoutHandle = setTimeout(
        () =>
          this.abortTask(
            task,
            new PdfGenerationTimeoutException(task.timeoutMs),
          ),
        remainingMs,
      );

      if (task.externalSignal) {
        task.externalAbortHandler = () =>
          this.abortTask(task, new PdfRequestCancelledException());
        task.externalSignal.addEventListener(
          'abort',
          task.externalAbortHandler,
          { once: true },
        );
        if (task.externalSignal.aborted) task.externalAbortHandler();
      }

      if (this.activeCount < this.concurrency && !this.queue.includes(task)) {
        this.startTask(task);
      }
    });
  }

  private processQueue(): void {
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.updateCapacityMetrics();
      if (task.state === 'queued') this.startTask(task);
    }
  }

  private startTask(task: SemaphoreTask): void {
    if (task.state !== 'queued') return;
    if (Date.now() >= task.deadlineAt) {
      this.abortTask(task, new PdfGenerationTimeoutException(task.timeoutMs));
      return;
    }

    task.state = 'running';
    this.activeCount++;
    this.updateCapacityMetrics();
    this.metrics?.pdfQueueWaitDuration.observe(
      { document_type: task.documentType },
      (Date.now() - task.enqueuedAt) / 1000,
    );

    task
      .fn(task.abortController.signal)
      .then((buffer) => {
        if (task.abortController.signal.aborted) {
          throw this.abortReason(task.abortController.signal);
        }
        this.settleTask(task, undefined, buffer);
      })
      .catch((error: unknown) => this.settleTask(task, error))
      .finally(() => {
        this.activeCount--;
        this.updateCapacityMetrics();
        this.processQueue();
      });
  }

  private abortTask(task: SemaphoreTask, error: Error): void {
    if (task.state === 'settled') return;
    if (task.state === 'queued') {
      const index = this.queue.indexOf(task);
      if (index >= 0) this.queue.splice(index, 1);
      this.updateCapacityMetrics();
      this.settleTask(task, error);
      return;
    }
    if (!task.abortController.signal.aborted) {
      task.abortController.abort(error);
    }
  }

  private settleTask(
    task: SemaphoreTask,
    error?: unknown,
    buffer?: Buffer,
  ): void {
    if (task.state === 'settled') return;
    task.state = 'settled';
    this.cleanupTask(task);

    const status = error ? this.metricStatus(error) : 'success';
    this.metrics?.pdfTotalDuration.observe(
      { document_type: task.documentType, status },
      (Date.now() - task.requestedAt) / 1000,
    );
    this.metrics?.samplePdfProcessResources();

    if (error) {
      this.recordFailure(task.documentType, error);
      task.reject(error);
      return;
    }

    this.totalRenders++;
    task.resolve(buffer!);
  }

  private cleanupTask(task: SemaphoreTask): void {
    if (task.timeoutHandle) clearTimeout(task.timeoutHandle);
    if (task.externalSignal && task.externalAbortHandler) {
      task.externalSignal.removeEventListener(
        'abort',
        task.externalAbortHandler,
      );
    }
  }

  private recordImmediateFailure(
    documentType: string,
    requestedAt: number,
    error: Error,
  ): void {
    this.metrics?.pdfTotalDuration.observe(
      { document_type: documentType, status: this.metricStatus(error) },
      (Date.now() - requestedAt) / 1000,
    );
    this.recordFailure(documentType, error);
  }

  private recordFailure(documentType: string, error: unknown): void {
    this.totalErrors++;
    this.lastErrorAt = new Date().toISOString();
    this.lastErrorMessage =
      error instanceof Error ? error.message : String(error);

    if (error instanceof PdfGenerationTimeoutException) {
      this.totalTimeouts++;
      this.metrics?.pdfTimeoutsTotal.inc({ document_type: documentType });
    } else if (error instanceof PdfQueueSaturatedException) {
      this.totalRejections++;
      this.metrics?.pdfRejectionsTotal.inc({ document_type: documentType });
    } else if (error instanceof PdfRequestCancelledException) {
      this.totalCancellations++;
      this.metrics?.pdfCancellationsTotal.inc({
        document_type: documentType,
      });
    }
  }

  private metricStatus(error: unknown): string {
    if (error instanceof PdfGenerationTimeoutException) return 'timeout';
    if (error instanceof PdfQueueSaturatedException) return 'rejected';
    if (error instanceof PdfRequestCancelledException) return 'cancelled';
    return 'error';
  }

  private abortReason(signal: AbortSignal): Error {
    return signal.reason instanceof Error
      ? signal.reason
      : new PdfRequestCancelledException();
  }

  private raceWithAbort<T>(
    operation: Promise<T>,
    signal: AbortSignal,
  ): Promise<T> {
    if (signal.aborted) {
      return Promise.reject(this.abortReason(signal));
    }

    return new Promise<T>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        reject(this.abortReason(signal));
      };
      signal.addEventListener('abort', onAbort, { once: true });
      operation.then(
        (value) => {
          signal.removeEventListener('abort', onAbort);
          resolve(value);
        },
        (error) => {
          signal.removeEventListener('abort', onAbort);
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      );
    });
  }

  private updateCapacityMetrics(): void {
    this.metrics?.pdfQueueDepth.set(this.queue.length);
    this.metrics?.pdfActiveRenders.set(this.activeCount);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.documentTypes.keys());
  }

  getDocumentType<TInput = object, TOutput extends object = object>(
    type: string,
  ): PdfDocumentType<TInput, TOutput> | undefined {
    return this.documentTypes.get(type) as
      | PdfDocumentType<TInput, TOutput>
      | undefined;
  }

  getHealthStatus() {
    this.metrics?.samplePdfProcessResources();
    return {
      status: this.browser?.connected ? 'healthy' : 'unhealthy',
      browser: {
        connected: this.browser?.connected ?? false,
        launchInFlight: this.browserLaunchPromise !== null,
        uptimeMs: this.browser?.connected
          ? Date.now() - this.browserLaunchTime
          : 0,
      },
      semaphore: {
        concurrency: this.concurrency,
        maxQueueSize: this.maxQueueSize,
        activeSlots: this.activeCount,
        availableSlots: this.concurrency - this.activeCount,
        queueLength: this.queue.length,
      },
      metrics: {
        totalRenders: this.totalRenders,
        totalErrors: this.totalErrors,
        totalTimeouts: this.totalTimeouts,
        totalRejections: this.totalRejections,
        totalCancellations: this.totalCancellations,
        browserRestarts: this.browserRestarts,
        lastErrorAt: this.lastErrorAt,
        lastErrorMessage: this.lastErrorMessage,
      },
      process: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
