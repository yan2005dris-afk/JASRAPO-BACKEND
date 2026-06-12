import type { Readable } from 'stream';

/**
 * Options for upload operations
 */
export interface UploadOptions {
  /** MIME content type */
  contentType?: string;
  /** Custom metadata key-value pairs */
  metadata?: Record<string, string>;
}

/**
 * Result of an upload operation
 */
export interface UploadResult {
  /** The stored object key */
  key: string;
  /** Size in bytes */
  size: number;
  /** Content type */
  contentType?: string;
}

/**
 * Unified storage abstraction interface
 * Encapsulates MinIO object storage operations
 *
 * ## Usage
 * Inject `StorageService` directly to interact with object storage.
 *
 * ## Bucket Naming Convention
 * For multi-tenant storage, buckets follow the pattern: `sri-{ruc}-{type}`
 * Examples:
 *   - `sri-179xxxxxxx-xmls` - XML documents for RUC 179xxxxxxx
 *   - `sri-179xxxxxxx-templates` - Templates for RUC 179xxxxxxx
 *   - `sri-179xxxxxxx-pdfs` - PDFs for RUC 179xxxxxxx
 *   - `sri-179xxxxxxx-images` - Images for RUC 179xxxxxxx
 *   - `sri-179xxxxxxx-profile-photos` - User profile photos
 *   - `sri-179xxxxxxx-readings` - Meter reading photos
 *   - `sri-179xxxxxxx-reading-news` - Photos for reading news/anomalies
 *
 * Legacy static buckets (deprecated): sri-xmls, sri-templates, sri-pdfs, sri-images, sri-certs, profile-photos, readings, reading-news
 *
 * ## Key Prefixes by Type
 * - XML: `xmls/{ruc}/{year}/{month}/{day}/{claveAcceso}.xml`
 * - Templates: `templates/{timestamp}-{filename}`
 * - PDFs: `pdfs/{type}/{timestamp}_{filename}`
 * - Images: `images/{timestamp}_{filename}`
 * - Profile Photos: `avatars/{userId}_{timestamp}.png`
 * - Readings: `readings/{periodId}/{medidorId}_{timestamp}.jpg`
 */
export interface IStorageService {
  /**
   * Uploads a buffer and returns the stored key
   */
  upload(
    bucket: string,
    key: string,
    buffer: Buffer,
    options?: UploadOptions,
  ): Promise<UploadResult>;

  /**
   * Generates a presigned URL for temporary access
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresInSeconds - URL expiration (default: 24 hours)
   */
  getUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  /**
   * Deletes an object from storage
   */
  delete(bucket: string, key: string): Promise<void>;

  /**
   * Checks if an object exists
   */
  exists(bucket: string, key: string): Promise<boolean>;

  /**
   * Lists objects with optional prefix filter
   */
  list(bucket: string, prefix?: string): Promise<string[]>;

  /**
   * Gets a readable stream for the object
   */
  getObject(bucket: string, key: string): Promise<Readable>;

  /**
   * Refreshes the URL for an existing object
   * (Generates a new presigned URL, same object key)
   */
  refreshUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number,
  ): Promise<string>;
}
