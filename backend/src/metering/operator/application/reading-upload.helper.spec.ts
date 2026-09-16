import {
  uploadReadingPhoto,
  rollbackReadingPhoto,
} from './reading-upload.helper';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

const mockStorageService = { upload: jest.fn(), delete: jest.fn() };
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const fakeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File => ({
  fieldname: 'foto',
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  buffer: png,
  size: png.length,
  encoding: '7bit',
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
  ...overrides,
});

describe('reading-upload.helper', () => {
  beforeEach(() => jest.clearAllMocks());

  it('validates binary format and uploads using the detected format', async () => {
    mockStorageService.upload.mockResolvedValue({});
    const key = await uploadReadingPhoto(fakeFile(), mockStorageService as any);
    expect(mockStorageService.upload).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READINGS,
      expect.stringMatching(/^readings\/.+\.png$/),
      png,
      { contentType: 'image/png' },
    );
    expect(key).toMatch(/^readings\/.+\.png$/);
  });

  it('rejects MIME/extension spoofing and malformed bytes before storage', async () => {
    await expect(
      uploadReadingPhoto(
        fakeFile({
          mimetype: 'image/png',
          originalname: 'x.png',
          buffer: Buffer.from('not-an-image'),
        }),
        mockStorageService as any,
      ),
    ).rejects.toThrow();
    expect(mockStorageService.upload).not.toHaveBeenCalled();
  });

  it('deletes the generated key when storage upload fails', async () => {
    mockStorageService.upload.mockRejectedValue(
      new Error('storage unavailable'),
    );

    await expect(
      uploadReadingPhoto(fakeFile(), mockStorageService as any),
    ).rejects.toThrow('storage unavailable');

    expect(mockStorageService.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READINGS,
      expect.stringMatching(/^readings\/.+\.png$/),
    );
  });

  it('removes an uploaded photo on rollback without masking the original failure', async () => {
    mockStorageService.delete.mockRejectedValue(new Error('unavailable'));
    await expect(
      rollbackReadingPhoto('readings/key.png', mockStorageService as any),
    ).resolves.toBeUndefined();
    expect(mockStorageService.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READINGS,
      'readings/key.png',
    );
  });
});
