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
import puppeteer, { type Browser } from 'puppeteer';
import type { PdfDocumentType } from './document-type.interface';

@Injectable()
export class PdfService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PdfService.name);
  private readonly templatesDir: string;
  private readonly documentTypes = new Map<string, PdfDocumentType>();
  private browser: Browser | null = null;

  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('math', (a: number, op: string, b: number) => {
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return a;
      }
    });
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    }
    return this.browser;
  }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Warming up Puppeteer browser...');
    await this.getBrowser();
    this.logger.log('Puppeteer browser ready.');
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.browser?.connected) {
      this.logger.log('Closing Puppeteer browser...');
      await this.browser.close();
      this.browser = null;
    }
  }

  registerDocumentType(docType: PdfDocumentType): void {
    if (this.documentTypes.has(docType.type)) {
      this.logger.warn(`Document type '${docType.type}' already registered, overriding.`);
    }
    this.documentTypes.set(docType.type, docType);
    this.logger.log(`Registered PDF type: ${docType.type}`);
  }

  async render(templateName: string, data: Record<string, unknown>): Promise<Buffer> {
    const templateFile = path.join(this.templatesDir, `${templateName}.hbs`);
    if (!fs.existsSync(templateFile)) {
      throw new NotFoundException(`Template not found: ${templateName}.hbs`);
    }
    const html = this.renderTemplate(templateFile, data);
    return this.htmlToPdf(html);
  }

  private renderTemplate(templateFile: string, data: Record<string, unknown>): string {
    const source = fs.readFileSync(templateFile, 'utf8');
    const template = Handlebars.compile(source);
    return template(data);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  getAvailableTypes(): string[] {
    return Array.from(this.documentTypes.keys());
  }

  getDocumentType(type: string): PdfDocumentType | undefined {
    return this.documentTypes.get(type);
  }
}
