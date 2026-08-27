import * as fs from 'node:fs';
import * as path from 'node:path';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { REPORT_TEMPLATE_FIXTURES } from './fixtures/report-template.fixture';

const GOLDENS_ROOT = path.resolve(__dirname, 'goldens/html');

function normalizeHtml(html: string): string {
  return `${html
    .replace(
      /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
      'data:image/jpeg;base64,PDF_LOGO_DATA',
    )
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()}\n`;
}

describe('report HTML goldens', () => {
  it('reportHtmlGoldenMatchesApprovedTemplate', () => {
    const pdfService = new PdfService();

    for (const fixture of REPORT_TEMPLATE_FIXTURES) {
      const goldenPath = path.join(GOLDENS_ROOT, `${fixture.type}.html`);
      const actual = normalizeHtml(
        pdfService.renderHtml(fixture.template, fixture.data),
      );

      if (process.env['UPDATE_PDF_GOLDENS'] === '1') {
        fs.mkdirSync(GOLDENS_ROOT, { recursive: true });
        fs.writeFileSync(goldenPath, actual, 'utf8');
      }

      expect(fs.existsSync(goldenPath)).toBe(true);
      expect(actual).toBe(fs.readFileSync(goldenPath, 'utf8'));
    }
  });

  it('legacyAndModernVisualBaselinesAreReviewedSeparately', () => {
    const grouped = new Map<
      string,
      (typeof REPORT_TEMPLATE_FIXTURES)[number][]
    >();
    for (const fixture of REPORT_TEMPLATE_FIXTURES) {
      grouped.set(fixture.family, [
        ...(grouped.get(fixture.family) ?? []),
        fixture,
      ]);
    }

    for (const [family, fixtures] of grouped) {
      const styles = fixtures.map(({ style }) => style);
      if (styles.includes('unique')) {
        expect(styles).toEqual(['unique']);
        expect(fixtures[0].type).toBe('payment-agreement');
        continue;
      }

      expect(styles.sort()).toEqual(['legacy', 'modern']);
      const paths = fixtures.map(({ type }) =>
        path.join(GOLDENS_ROOT, `${type}.html`),
      );
      expect(new Set(paths).size).toBe(2);
      expect(paths.every((goldenPath) => fs.existsSync(goldenPath))).toBe(true);
      expect(family).not.toBe('payment-agreement');
    }
  });
});
