import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { SriDocumentPdfType } from './sri-document.pdf-type';

const templatePath = path.resolve(
  __dirname,
  '../../../../infrastructure/pdf/templates/sri-document.hbs',
);

function renderSRI(raw: Record<string, unknown>): string {
  const source = fs.readFileSync(templatePath, 'utf8');
  return Handlebars.compile(source)(SriDocumentPdfType.adaptData(raw));
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
