import type { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  StorageService,
  SriStorageType,
} from 'src/infrastructure/storage/storage.service';
import { ImageProcessorUtil } from './image-processor.util';

export const EVIDENCE_IMAGE_TYPES = /^image\/(jpg|jpeg|png|webp)$/i;
export const EVIDENCE_IMAGE_MAX_WIDTH = 1024;
export const EVIDENCE_IMAGE_QUALITY = 80;

/**
 * Factory for FileInterceptor fileFilter — validates image MIME types.
 * Centralizes the allowed image types to avoid duplication across controllers.
 */
export function createImageFileFilter() {
  return (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    if (!file.mimetype.match(EVIDENCE_IMAGE_TYPES)) {
      return callback(
        new BadRequestException(
          'Solo se permiten imágenes (jpg, jpeg, png, webp)',
        ),
        false,
      );
    }
    callback(null, true);
  };
}

/**
 * Processes and uploads an evidence image:
 * 1. Converts to WebP via ImageProcessorUtil (1024px, 80% quality)
 * 2. Uploads to the configured storage backend
 * 3. Returns the storage key
 */
export async function uploadEvidence(
  file: Express.Multer.File,
  storageService: StorageService,
  bucketType: SriStorageType,
  keyPrefix: string,
  logger?: Logger,
): Promise<string> {
  logger?.debug(`Procesando evidencia (${file.size} bytes, ${file.mimetype})`);
  const processedBuffer = await ImageProcessorUtil.toWebP(file.buffer, {
    width: EVIDENCE_IMAGE_MAX_WIDTH,
    quality: EVIDENCE_IMAGE_QUALITY,
  });
  const key = `${keyPrefix}/${randomUUID()}.webp`;
  logger?.debug(`Subiendo evidencia a storage: ${key}`);
  await storageService.upload(bucketType, key, processedBuffer, {
    contentType: 'image/webp',
  });
  return key;
}

/**
 * Rollback helper — deletes an uploaded evidence key when the main
 * database operation fails. Logs but never throws.
 */
export async function rollbackEvidenceUpload(
  key: string,
  storageService: StorageService,
  bucketType: SriStorageType,
  logger: Logger,
  context: string,
): Promise<void> {
  logger.warn(`[${context}] Revirtiendo subida por fallo en operación: ${key}`);
  await storageService.delete(bucketType, key).catch((e: Error) => {
    logger.warn(
      `[${context}] No se pudo revertir la subida (${key}): ${e.message}`,
    );
  });
}

/**
 * Deletes the old evidence image after a successful update that replaced it.
 * Logs but never throws.
 */
export async function deleteOldEvidence(
  oldKey: string,
  newKey: string,
  storageService: StorageService,
  bucketType: SriStorageType,
  logger: Logger,
  context: string,
): Promise<void> {
  if (!newKey || !oldKey) return;
  await storageService.delete(bucketType, oldKey).catch((e: Error) => {
    logger.warn(
      `[${context}] No se pudo borrar la evidencia anterior (${oldKey}): ${e.message}`,
    );
  });
}
