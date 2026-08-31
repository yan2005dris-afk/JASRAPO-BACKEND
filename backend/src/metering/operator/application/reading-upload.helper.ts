import { randomUUID } from 'crypto';
import type { StorageService } from 'src/infrastructure/storage/storage.service';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';
import {
  validateEvidenceImage,
  type EvidenceLogger,
} from 'src/infrastructure/common/utils/evidence-upload.util';

const OPERATOR_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function uploadReadingPhoto(
  file: Express.Multer.File,
  storageService: StorageService,
  logger?: EvidenceLogger,
): Promise<string> {
  const metadata = await validateEvidenceImage(
    file.buffer,
    OPERATOR_MAX_UPLOAD_BYTES,
  );
  (
    file as Express.Multer.File & { evidenceMetadata?: unknown }
  ).evidenceMetadata = metadata;
  const key = `readings/${randomUUID()}.${metadata.format === 'jpeg' ? 'jpg' : metadata.format}`;
  (
    file as Express.Multer.File & { evidenceMetadata?: Record<string, unknown> }
  ).evidenceMetadata = { ...metadata, storageKey: key, outcome: 'validated' };
  logger?.debug(
    `Subiendo evidencia operator key=${key} format=${metadata.format} dimensions=${metadata.width}x${metadata.height}`,
  );
  try {
    await storageService.upload(SRI_STORAGE_TYPES.READINGS, key, file.buffer, {
      contentType: metadata.contentType,
    });
  } catch (error) {
    (
      file as Express.Multer.File & {
        evidenceMetadata?: Record<string, unknown>;
      }
    ).evidenceMetadata = {
      ...metadata,
      storageKey: key,
      outcome: 'upload_failed',
    };
    await rollbackReadingPhoto(key, storageService, logger);
    throw error;
  }
  (
    file as Express.Multer.File & { evidenceMetadata?: Record<string, unknown> }
  ).evidenceMetadata = { ...metadata, storageKey: key, outcome: 'uploaded' };
  return key;
}

export async function rollbackReadingPhoto(
  key: string,
  storageService: StorageService,
  logger?: EvidenceLogger,
): Promise<void> {
  logger?.warn(`[OPERATOR] evidence_cleanup outcome=rollback key=${key}`);
  try {
    await storageService.delete(SRI_STORAGE_TYPES.READINGS, key);
    logger?.debug(`[OPERATOR] evidence_cleanup outcome=rolled_back key=${key}`);
  } catch (error) {
    logger?.warn(
      `[OPERATOR] evidence_cleanup outcome=failed key=${key} error=${(error as Error).message}`,
    );
  }
}
