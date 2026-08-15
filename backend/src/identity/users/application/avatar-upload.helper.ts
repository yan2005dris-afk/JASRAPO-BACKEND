import { randomUUID } from 'crypto';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import type { StorageService } from 'src/infrastructure/storage/storage.service';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

/**
 * Processes and uploads a profile avatar:
 * 1. Converts to WebP via ImageProcessorUtil (512px, 80% quality)
 * 2. Uploads to the PROFILE_PHOTOS bucket under `avatars/{uuid}.webp`
 * 3. Returns the storage key
 */
export async function uploadAvatar(
  file: Express.Multer.File,
  storageService: StorageService,
): Promise<string> {
  const processedBuffer = await ImageProcessorUtil.processProfilePicture(
    file.buffer,
  );

  const avatarKey = `avatars/${randomUUID()}.webp`;

  await storageService.upload(
    SRI_STORAGE_TYPES.PROFILE_PHOTOS,
    avatarKey,
    processedBuffer,
    { contentType: 'image/webp' },
  );

  return avatarKey;
}

/**
 * Rollback helper — deletes a freshly uploaded avatar key when the main
 * database operation fails. Fire-and-forget; never throws.
 */
export async function rollbackAvatarUpload(
  key: string,
  storageService: StorageService,
): Promise<void> {
  await storageService
    .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, key)
    .catch(() => {});
}

/**
 * Deletes the old avatar after a successful update that replaced it.
 * Fire-and-forget; never throws.
 */
export async function deleteOldAvatar(
  oldKey: string | undefined,
  newKey: string | undefined,
  storageService: StorageService,
): Promise<void> {
  if (!oldKey || !newKey || oldKey === newKey) return;
  await storageService
    .delete(SRI_STORAGE_TYPES.PROFILE_PHOTOS, oldKey)
    .catch(() => {});
}
