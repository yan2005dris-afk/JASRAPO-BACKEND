import {
  uploadReadingPhoto,
  rollbackReadingPhoto,
} from './reading-upload.helper';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

const mockStorageService = {
  upload: jest.fn(),
  delete: jest.fn(),
};

const fakeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File => ({
  fieldname: 'foto',
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake-image-data'),
  size: 15,
  encoding: '7bit',
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
  ...overrides,
});

describe('reading-upload.helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadReadingPhoto', () => {
    it('uploads to the READINGS bucket and returns a storage key', async () => {
      mockStorageService.upload.mockResolvedValue({
        key: 'readings/uuid.jpg',
        size: 15,
        contentType: 'image/jpeg',
      });

      const key = await uploadReadingPhoto(
        fakeFile(),
        mockStorageService as any,
      );

      expect(mockStorageService.upload).toHaveBeenCalledWith(
        SRI_STORAGE_TYPES.READINGS,
        expect.stringMatching(/^readings\/.+\.jpg$/),
        expect.any(Buffer),
        { contentType: 'image/jpeg' },
      );
      expect(key).toMatch(/^readings\/.+\.jpg$/);
    });

    it('preserves the original file extension', async () => {
      mockStorageService.upload.mockResolvedValue({});

      const key = await uploadReadingPhoto(
        fakeFile({ originalname: 'evidence.png', mimetype: 'image/png' }),
        mockStorageService as any,
      );

      expect(key).toMatch(/^readings\/.+\.png$/);
    });

    it('uses the full filename as extension when there is no dot separator', async () => {
      mockStorageService.upload.mockResolvedValue({});

      const key = await uploadReadingPhoto(
        fakeFile({ originalname: 'noext' }),
        mockStorageService as any,
      );

      // split('.').pop() returns the full string when there is no '.', so the
      // resulting key ends with ".noext" — this is acceptable for edge cases
      // where the frontend sends a filename without an extension.
      expect(key).toMatch(/^readings\/.+\.noext$/);
    });
  });

  describe('rollbackReadingPhoto', () => {
    it('deletes the key from the READINGS bucket', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);

      await rollbackReadingPhoto(
        'readings/some-uuid.jpg',
        mockStorageService as any,
      );

      expect(mockStorageService.delete).toHaveBeenCalledWith(
        SRI_STORAGE_TYPES.READINGS,
        'readings/some-uuid.jpg',
      );
    });

    it('does not throw when the delete fails (fire-and-forget)', async () => {
      mockStorageService.delete.mockRejectedValue(
        new Error('bucket unreachable'),
      );

      await expect(
        rollbackReadingPhoto(
          'readings/some-uuid.jpg',
          mockStorageService as any,
        ),
      ).resolves.toBeUndefined();
    });
  });
});
