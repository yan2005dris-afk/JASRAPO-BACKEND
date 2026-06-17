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
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import {
  SLASH_SEPARATOR,
  resolveContentType,
} from './storage-proxy.constants';

/**
 * Buckets accessible via the public storage proxy.
 * Add a bucket here only when its content is meant to be publicly readable.
 * Private buckets (xmls, certs, pdfs, etc.) must never appear here.
 */
const PUBLIC_BUCKETS = new Set<string>([
  SRI_STORAGE_TYPES.PROFILE_PHOTOS,
  SRI_STORAGE_TYPES.READINGS,
  SRI_STORAGE_TYPES.READING_NEWS,
]);

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
    if (!PUBLIC_BUCKETS.has(bucket)) {
      throw new NotFoundException('File not found');
    }

    const actualKey = key.replaceAll(SLASH_SEPARATOR, '/');

    if (actualKey.includes('..')) {
      throw new NotFoundException('File not found');
    }

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

    stream.on('error', (streamError: Error & { code?: string }) => {
      this.logger.warn(
        `[STORAGE_PROXY] Stream error for ${bucket}/${actualKey}: ${streamError.message}`,
      );
      if (!res.headersSent) {
        const isNotFound =
          streamError.code === 'NoSuchKey' ||
          streamError.message?.includes('does not exist');
        const status = isNotFound ? 404 : 500;
        res.status(status).json({
          statusCode: status,
          message: isNotFound ? 'File not found' : 'Storage error',
          error: isNotFound ? 'Not Found' : 'Internal Server Error',
        });
      }
    });

    stream.pipe(res);
  }
}
