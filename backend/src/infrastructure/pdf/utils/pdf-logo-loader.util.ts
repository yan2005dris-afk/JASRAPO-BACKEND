import * as fs from 'node:fs';
import * as path from 'node:path';

let cachedLogoUrl: string | null = null;

export function getPdfLogoUrl(): string {
  if (cachedLogoUrl !== null) {
    return cachedLogoUrl;
  }
  try {
    let logoPath = path.join(
      __dirname,
      '..',
      '..',
      'infrastructure',
      'pdf',
      'assets',
      'Logo.jpeg',
    );
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(
        process.cwd(),
        'src',
        'infrastructure',
        'pdf',
        'assets',
        'Logo.jpeg',
      );
    }
    const imageBuffer = fs.readFileSync(logoPath);
    cachedLogoUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  } catch {
    cachedLogoUrl = '';
  }
  return cachedLogoUrl;
}
