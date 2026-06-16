import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from 'src/infrastructure/common/decorators/public.decorator';
import { StorageService } from 'src/infrastructure/storage/storage.service';

const EXTENSION_MIME_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  zip: 'application/zip',
};

function resolveContentType(key: string): string {
  const dotIndex = key.lastIndexOf('.');
  if (dotIndex === -1) return 'application/octet-stream';

  const ext = key.slice(dotIndex + 1).toLowerCase();
  return EXTENSION_MIME_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * S3 keys like `avatars/uuid.webp` contain slashes that conflict with
 * Express path params. We replace `/` with `--` in the URL and revert it here.
 * Safe because UUIDs only contain hex chars and dashes, never `--`.
 */
const SLASH_SEPARATOR = '--';

/**
 * Generic proxy for serving files from S3-compatible storage.
 *
 * Exposes stable URLs that stream files directly from the storage backend
 * with HTTP caching headers, replacing expiring presigned URLs.
 *
 * Works for any file type — images, PDFs, office docs, etc.
 * Content-Type is resolved from the file extension in the key.
 *
 * Cache strategy:
 *   Cache-Control: public, max-age=31536000, immutable  (1 year in browser)
 *   Nginx proxy_cache: caches on disk so repeated requests skip the backend
 *
 * Key rotation: uploads generate a new UUID key → URL changes → browser fetches fresh.
 */
@ApiExcludeController()
@Controller('storage')
export class StorageProxyController {
  private readonly logger = new Logger(StorageProxyController.name);

  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get(':bucket/:key')
  async serveFile(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Res() res: Response,
  ): Promise<void> {
    const actualKey = key.replace(new RegExp(SLASH_SEPARATOR, 'g'), '/');

    let stream;
    try {
      stream = await this.storageService.getObject(bucket, actualKey);
    } catch (error) {
      this.logger.warn(
        `[STORAGE_PROXY] Error fetching ${bucket}/${actualKey}: ${error.message}`,
      );
      throw new NotFoundException('File not found');
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${actualKey}"`);
    res.setHeader('Content-Type', resolveContentType(actualKey));

    stream.on('error', (streamError: Error) => {
      this.logger.warn(
        `[STORAGE_PROXY] Stream error for ${bucket}/${actualKey}: ${streamError.message}`,
      );
      if (!res.headersSent) {
        res.status(404).json({
          statusCode: 404,
          message: 'File not found',
          error: 'Not Found',
        });
      }
    });

    stream.pipe(res);
  }
}
