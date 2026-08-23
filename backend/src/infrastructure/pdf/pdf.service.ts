import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { PdfDocumentType } from './document-type.interface';
import { withTimeout } from '../../common/async/with-timeout';

const PDF_CONCURRENCY = Number(process.env['PDF_CONCURRENCY']) || 4;
const PDF_TIMEOUT_MS = Number(process.env['PDF_TIMEOUT_MS']) || 30_000;

interface SemaphoreTask {
  fn: () => Promise<Buffer>;
  resolve: (value: Buffer) => void;
  reject: (reason: unknown) => void;
}

@Injectable()
export class PdfService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PdfService.name);
  private readonly templatesDir: string;
  private readonly documentTypes = new Map<
    string,
    PdfDocumentType<never, object>
  >();
  private readonly templateCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();
  browser: Browser | null = null; // exposed for health checks

  // Concurrency semaphore
  readonly concurrency = PDF_CONCURRENCY;
  private readonly queue: SemaphoreTask[] = [];
  private activeCount = 0;

  // Health metrics
  private browserLaunchTime = 0;
  private totalRenders = 0;
  private totalErrors = 0;
  private lastErrorAt: string | null = null;
  private lastErrorMessage: string | null = null;

  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('math', (a: number, op: string, b: number) => {
      switch (op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          return a / b;
        default:
          return a;
      }
    });
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
    Handlebars.registerHelper('gt', (a: any, b: any) => Number(a) > Number(b));
    Handlebars.registerHelper(
      'gte',
      (a: any, b: any) => Number(a) >= Number(b),
    );
    Handlebars.registerHelper('lt', (a: any, b: any) => Number(a) < Number(b));
    Handlebars.registerHelper(
      'lte',
      (a: any, b: any) => Number(a) <= Number(b),
    );
  }

  private registerPartials(): void {
    // Register base styles partial
    const stylesPath = path.join(this.templatesDir, 'styles.hbs');
    if (fs.existsSync(stylesPath)) {
      Handlebars.registerPartial('styles', fs.readFileSync(stylesPath, 'utf8'));
    }

    // Register modern-styles partial (extracted CSS chrome)
    const modernStylesPath = path.join(
      this.templatesDir,
      'partials',
      'modern-styles.hbs',
    );
    if (fs.existsSync(modernStylesPath)) {
      Handlebars.registerPartial(
        'modern-styles',
        fs.readFileSync(modernStylesPath, 'utf8'),
      );
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
      this.browserLaunchTime = Date.now();
      this.logger.log('Puppeteer browser launched (or re-launched)');
    }
    return this.browser;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Warming up Puppeteer browser...');
    await this.getBrowser();

    // Register Handlebars partials (styles + modern-styles)
    this.registerPartials();

    // Pre-compile all registered templates into the cache
    const types = this.getAvailableTypes();
    this.logger.log(`Pre-compiling ${types.length} templates...`);
    for (const type of types) {
      const docType = this.documentTypes.get(type);
      if (!docType) continue;
      const templatePath = path.join(
        this.templatesDir,
        `${docType.template}.hbs`,
      );
      if (fs.existsSync(templatePath)) {
        const source = fs.readFileSync(templatePath, 'utf8');
        this.templateCache.set(docType.template, Handlebars.compile(source));
      }
    }
    this.logger.log(
      `Template cache populated with ${this.templateCache.size} entries.`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.browser?.connected) {
      this.logger.log('Closing Puppeteer browser...');
      await this.browser.close();
      this.browser = null;
    }
  }

  registerDocumentType<TInput, TOutput extends object>(
    docType: PdfDocumentType<TInput, TOutput>,
  ): void {
    if (this.documentTypes.has(docType.type)) {
      this.logger.warn(
        `Document type '${docType.type}' already registered, overriding.`,
      );
    }
    this.documentTypes.set(docType.type, docType);
    this.logger.log(`Registered PDF type: ${docType.type}`);
  }

  async render(templateName: string, data: object): Promise<Buffer> {
    const templateFile = path.join(this.templatesDir, `${templateName}.hbs`);
    if (!fs.existsSync(templateFile)) {
      throw new NotFoundException(`Template not found: ${templateName}.hbs`);
    }
    const html = this.renderTemplate(templateName, data);
    return this.htmlToPdf(html);
  }

  private renderTemplate(templateName: string, data: object): string {
    let tpl = this.templateCache.get(templateName);
    if (!tpl) {
      // Cold-start / dev-injected template: compile on demand and cache
      const templateFile = path.join(this.templatesDir, `${templateName}.hbs`);
      const source = fs.readFileSync(templateFile, 'utf8');
      tpl = Handlebars.compile(source);
      this.templateCache.set(templateName, tpl);
    }
    return tpl(data);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    try {
      const result = await this.runWithSemaphore(async () => {
        const browser = await this.getBrowser();
        const page: Page = await browser.newPage();
        try {
          await withTimeout(
            page.setContent(html, { waitUntil: 'load' }),
            PDF_TIMEOUT_MS,
            'page.setContent',
          );
          const pdf = await withTimeout(
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
            PDF_TIMEOUT_MS,
            'page.pdf',
          );
          return Buffer.from(pdf);
        } finally {
          await page.close();
        }
      });
      this.totalRenders++;
      return result;
    } catch (err) {
      this.totalErrors++;
      this.lastErrorAt = new Date().toISOString();
      this.lastErrorMessage = (err as Error).message ?? String(err);
      throw err;
    }
  }

  /**
   * Simple concurrency semaphore: at most `this.concurrency` tasks run in
   * parallel.  If the limit is reached, further calls queue until a slot
   * opens up.  Errors inside `fn` release the slot immediately.
   */
  private async runWithSemaphore(fn: () => Promise<Buffer>): Promise<Buffer> {
    if (this.activeCount < this.concurrency) {
      this.activeCount++;
      try {
        return await fn();
      } finally {
        this.activeCount--;
        this.processQueue();
      }
    }

    return new Promise<Buffer>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
    });
  }

  private processQueue(): void {
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.activeCount++;
      task
        .fn()
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.activeCount--;
          this.processQueue();
        });
    }
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
    return {
      status: this.browser?.connected ? 'healthy' : 'unhealthy',
      browser: {
        connected: this.browser?.connected ?? false,
        uptimeMs: this.browser?.connected
          ? Date.now() - this.browserLaunchTime
          : 0,
      },
      semaphore: {
        concurrency: this.concurrency,
        activeSlots: this.activeCount,
        availableSlots: this.concurrency - this.activeCount,
        queueLength: this.queue.length,
      },
      metrics: {
        totalRenders: this.totalRenders,
        totalErrors: this.totalErrors,
        lastErrorAt: this.lastErrorAt,
        lastErrorMessage: this.lastErrorMessage,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
