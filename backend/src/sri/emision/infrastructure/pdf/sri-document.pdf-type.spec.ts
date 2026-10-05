import * as fs from 'node:fs';
import * as path from 'node:path';
import { Liquid } from 'liquidjs';
import { SriDocumentPdfType } from './sri-document.pdf-type';

const TEMPLATES_DIR = path.resolve(
  __dirname,
  '../../../../infrastructure/pdf/templates',
);

const templatePath = path.join(TEMPLATES_DIR, 'sri-document.liquid');

const liquidEngine = new Liquid({
  root: [TEMPLATES_DIR, path.join(TEMPLATES_DIR, 'partials')],
  extname: '.liquid',
  dynamicPartials: true,
  strictFilters: false,
  strictVariables: false,
});

liquidEngine.registerFilter('isEven', (a: unknown) => Number(a) % 2 === 0);
liquidEngine.registerFilter('isOdd', (a: unknown) => Number(a) % 2 !== 0);

function renderSRI(raw: Record<string, unknown>): string {
  const source = fs.readFileSync(templatePath, 'utf8');
  return liquidEngine.renderSync(
    liquidEngine.parse(source),
    SriDocumentPdfType.adaptData(raw),
  );
}

describe('SriDocumentPdfType', () => {
  it('does not require an institutional profile and renders the issuer logo when provided', () => {
    expect(SriDocumentPdfType.requiresInstitutionalProfile).toBe(false);

    const html = renderSRI({
      emisor: {
        razonSocial: 'Issuer',
        logoUrl: 'data:image/png;base64,issuer-logo',
      },
    });

    expect(html).toContain('src="data:image/png;base64,issuer-logo"');
    expect(html).not.toContain('institucion');
  });

  it('renders without a logo or institutional profile', () => {
    const html = renderSRI({ emisor: { razonSocial: 'Issuer' } });

    expect(html).not.toContain('<img');
    expect(html).not.toContain('institucion');
  });
});
