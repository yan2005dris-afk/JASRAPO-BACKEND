import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import type {
  StorageService,
  SriStorageType,
} from 'src/infrastructure/storage/storage.service';
import {
  EVIDENCE_IMAGE_QUALITY,
  EVIDENCE_MAX_INPUT_HEIGHT_PX,
  EVIDENCE_MAX_INPUT_WIDTH_PX,
  EVIDENCE_MAX_PIXELS,
  EVIDENCE_MAX_WIDTH_PX,
} from 'src/infrastructure/config/app.constants';
import { ImageProcessorUtil } from 'src/shared/utils/image-processor.util';

export type EvidenceLogger = {
  debug(message: string): void;
  warn(message: string): void;
};

/**
 * Allow-list regex for evidence MIME types — kept here because it's a structural
 * pattern (not a configurable value) and is referenced by the Multer fileFilter.
 */
export const EVIDENCE_IMAGE_TYPES = /^image\/(jpg|jpeg|png|webp)$/i;

export type DetectedImageFormat = 'jpeg' | 'png' | 'webp';
export interface EvidenceImageMetadata {
  format: DetectedImageFormat;
  width: number;
  height: number;
  contentType: `image/${string}`;
}

const SIGNATURES: ReadonlyArray<{
  format: DetectedImageFormat;
  contentType: EvidenceImageMetadata['contentType'];
  matches: (buffer: Buffer) => boolean;
}> = [
  {
    format: 'jpeg',
    contentType: 'image/jpeg',
    matches: (b) =>
      b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    format: 'png',
    contentType: 'image/png',
    matches: (b) =>
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  {
    format: 'webp',
    contentType: 'image/webp',
    matches: (b) =>
      b.length >= 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
];

export function detectImageFormat(buffer: Buffer): DetectedImageFormat {
  const match = SIGNATURES.find((signature) => signature.matches(buffer));
  if (!match) {
    throw new BadRequestException(
      'La evidencia no es una imagen JPEG, PNG o WebP válida',
    );
  }
  return match.format;
}

export async function validateEvidenceImage(
  buffer: Buffer,
  maxBytes: number,
): Promise<EvidenceImageMetadata> {
  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length === 0 ||
    buffer.length > maxBytes
  ) {
    throw new BadRequestException(
      `La evidencia excede el límite de ${maxBytes} bytes`,
    );
  }
  const format = detectImageFormat(buffer);
  try {
    const metadata = await sharp(buffer, {
      limitInputPixels: EVIDENCE_MAX_PIXELS,
      failOn: 'error',
    }).metadata();
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width > EVIDENCE_MAX_INPUT_WIDTH_PX ||
      metadata.height > EVIDENCE_MAX_INPUT_HEIGHT_PX
    ) {
      throw new BadRequestException(
        'Las dimensiones de la evidencia exceden el límite permitido',
      );
    }
    const signature = SIGNATURES.find((item) => item.format === format)!;
    return {
      format,
      width: metadata.width,
      height: metadata.height,
      contentType: signature.contentType,
    };
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(
      'La evidencia está corrupta o no puede ser decodificada',
    );
  }
}

/** Transport-only filter; authoritative validation runs after Multer populates buffer. */
export function createImageFileFilter() {
  return (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    if (!EVIDENCE_IMAGE_TYPES.test(file.mimetype)) {
      callback(
        new BadRequestException(
          'Solo se permiten archivos de imagen JPEG, PNG o WebP',
        ),
        false,
      );
      return;
    }
    callback(null, true);
  };
}

export async function uploadEvidence(
  file: Express.Multer.File,
  storageService: StorageService,
  bucketType: SriStorageType,
  keyPrefix: string,
  logger?: EvidenceLogger,
  maxBytes = 5 * 1024 * 1024,
): Promise<string> {
  const metadata = await validateEvidenceImage(file.buffer, maxBytes);
  (
    file as Express.Multer.File & { evidenceMetadata?: unknown }
  ).evidenceMetadata = metadata;
  logger?.debug(
    `Procesando evidencia (${file.size} bytes, ${metadata.format}, ${metadata.width}x${metadata.height})`,
  );
  const processedBuffer = await ImageProcessorUtil.toWebP(file.buffer, {
    width: EVIDENCE_MAX_WIDTH_PX,
    quality: EVIDENCE_IMAGE_QUALITY,
  });
  const key = `${keyPrefix}/${randomUUID()}.webp`;
  (
    file as Express.Multer.File & { evidenceMetadata?: Record<string, unknown> }
  ).evidenceMetadata = { ...metadata, storageKey: key, outcome: 'validated' };
  logger?.debug(
    `Subiendo evidencia a storage: key=${key} format=${metadata.format} dimensions=${metadata.width}x${metadata.height}`,
  );
  try {
    await storageService.upload(bucketType, key, processedBuffer, {
      contentType: 'image/webp',
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
    await rollbackEvidenceUpload(
      key,
      storageService,
      bucketType,
      logger ?? { debug: () => undefined, warn: () => undefined },
      'EVIDENCE-UPLOAD',
    );
    throw error;
  }
  (
    file as Express.Multer.File & { evidenceMetadata?: Record<string, unknown> }
  ).evidenceMetadata = { ...metadata, storageKey: key, outcome: 'uploaded' };
  return key;
}

export async function rollbackEvidenceUpload(
  key: string,
  storageService: StorageService,
  bucketType: SriStorageType,
  logger: EvidenceLogger,
  context: string,
): Promise<void> {
  logger.warn(`[${context}] evidence_cleanup outcome=rollback key=${key}`);
  try {
    await storageService.delete(bucketType, key);
  } catch (error) {
    logger.warn(
      `[${context}] evidence_cleanup outcome=failed key=${key} error=${(error as Error).message}`,
    );
  }
}

export async function deleteOldEvidence(
  oldKey: string,
  newKey: string,
  storageService: StorageService,
  bucketType: SriStorageType,
  logger: EvidenceLogger,
  context: string,
): Promise<void> {
  if (!newKey || !oldKey) return;
  try {
    await storageService.delete(bucketType, oldKey);
    logger.debug(
      `[${context}] evidence_cleanup outcome=old_deleted key=${oldKey}`,
    );
  } catch (error) {
    logger.warn(
      `[${context}] evidence_cleanup outcome=failed key=${oldKey} error=${(error as Error).message}`,
    );
  }
}
