import { uploadEvidence } from './evidence-upload.util';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const file = {
  buffer: png,
  size: png.length,
} as Express.Multer.File;

describe('uploadEvidence', () => {
  it('deletes the generated key when storage upload fails', async () => {
    const storage = {
      upload: jest.fn().mockRejectedValue(new Error('storage unavailable')),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      uploadEvidence(
        file,
        storage as any,
        SRI_STORAGE_TYPES.READING_NEWS,
        'reading-news',
      ),
    ).rejects.toThrow('storage unavailable');

    expect(storage.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READING_NEWS,
      expect.stringMatching(/^reading-news\/.+\.webp$/),
    );
    expect(
      (file as Express.Multer.File & { evidenceMetadata?: unknown })
        .evidenceMetadata,
    ).toMatchObject({
      outcome: 'upload_failed',
      storageKey: expect.any(String),
    });
  });
});
