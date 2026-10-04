import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { PreInvoicePdfDocumentType } from 'src/billing/pre-invoice/pdf/pre-invoice.pdf-type';
import { MetersInventoryPdfDocumentType } from 'src/metering/meters/pdf/meters-inventory.pdf-type';
import { ConnectionRequestPdfDocumentType } from 'src/operations/contracts/pdf/connection-request.pdf-type';
import { ResponsibilityAgreementPdfDocumentType } from 'src/operations/contracts/pdf/responsibility-agreement.pdf-type';
import { FieldSheetPdfDocumentType } from 'src/operations/routes/pdf/field-sheet.pdf-type';
import { SriDocumentPdfType } from 'src/sri/emision/infrastructure/pdf/sri-document.pdf-type';
import { REPORT_STYLE_CATALOG } from '../application/report-style.catalog';
import { REPORT_PDF_DOCUMENT_TYPES } from './report-pdf-document-types';
import { ReportsModule } from '../reports.module';

const TEMPLATES_ROOT = path.resolve(
  __dirname,
  '../../infrastructure/pdf/templates',
);
const PARTIAL_TEMPLATES = new Set(['styles']);
const STANDALONE_DOCUMENT_TYPES: readonly PdfDocumentType<never, object>[] = [
  PreInvoicePdfDocumentType,
  MetersInventoryPdfDocumentType,
  ConnectionRequestPdfDocumentType,
  ResponsibilityAgreementPdfDocumentType,
  FieldSheetPdfDocumentType,
  SriDocumentPdfType,
];
const OFFICIAL_DOCUMENT_TYPES = [
  ...REPORT_PDF_DOCUMENT_TYPES,
  ...STANDALONE_DOCUMENT_TYPES,
];

describe('official PDF document registry contract', () => {
  it('maps every report to its exact registered template and allowed style', () => {
    const registered: PdfDocumentType<never, object>[] = [];
    const module = new ReportsModule({
      registerDocumentType: (documentType: PdfDocumentType<never, object>) =>
        registered.push(documentType),
    } as never);

    module.onModuleInit();

    expect(registered).toEqual(REPORT_PDF_DOCUMENT_TYPES);
    for (const [reportKey, styles] of Object.entries(REPORT_STYLE_CATALOG)) {
      const expectedTypes = styles.map((style) =>
        style === 'unique' ? reportKey : `${reportKey}-${style}`,
      );
      const actualTypes = registered
        .filter(
          ({ type }) => type === reportKey || type.startsWith(`${reportKey}-`),
        )
        .map(({ type }) => type);

      expect(actualTypes.sort()).toEqual(expectedTypes.sort());
      for (const type of expectedTypes) {
        expect(registered.find((entry) => entry.type === type)?.template).toBe(
          type,
        );
      }
    }
  });

  it('rejects orphan, missing, duplicate and unauthorized templates', () => {
    const types = OFFICIAL_DOCUMENT_TYPES.map(({ type }) => type);
    const templates = OFFICIAL_DOCUMENT_TYPES.map(({ template }) => template);
    const templateFiles = fs
      .readdirSync(TEMPLATES_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.liquid'))
      .map((entry) => path.basename(entry.name, '.liquid'))
      .filter((template) => !PARTIAL_TEMPLATES.has(template));

    expect(new Set(types).size).toBe(types.length);
    expect(new Set(templates).size).toBe(templates.length);
    expect(templateFiles.sort()).toEqual([...templates].sort());

    const contentOwners = new Map<string, string>();
    for (const template of templates) {
      const source = fs
        .readFileSync(path.join(TEMPLATES_ROOT, `${template}.liquid`), 'utf8')
        .replace(/\s+/g, ' ')
        .trim();
      const digest = createHash('sha256').update(source).digest('hex');
      expect(contentOwners.get(digest)).toBeUndefined();
      contentOwners.set(digest, template);
    }
  });
});
