import * as fs from 'node:fs';
import { getPdfLogoUrl } from './pdf-logo-loader.util';

jest.mock('node:fs');

const fsMock = fs as jest.Mocked<typeof fs>;

describe('pdf-logo-loader.util', () => {
  const fakeImgBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const fakeImgBuffer = Buffer.from(fakeImgBase64, 'base64');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty string when Logo.jpeg does not exist', () => {
    (fsMock.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT: no such file');
    });

    const result = getPdfLogoUrl();

    expect(result).toBe('');
  });

  it('does not throw if the logo file is missing', () => {
    (fsMock.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(() => getPdfLogoUrl()).not.toThrow();
    expect(getPdfLogoUrl()).toBe('');
  });
});
