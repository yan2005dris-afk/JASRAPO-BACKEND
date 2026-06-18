/**
 * Base URL for the storage proxy controller.
 * Must match globalPrefix in main.ts ('api/v1') + controller path ('storage').
 *
 * S3 key slashes are encoded as '--' in URLs — the controller reverts them.
 * Example: avatars/uuid.webp → /api/v1/storage/profile-photos/avatars--uuid.webp
 */
export const STORAGE_PROXY_BASE = '/api/v1/storage';

/**
 * Separator used to encode `/` in S3 keys into URL-safe path segments.
 * Safe because UUIDs only contain hex chars and single dashes, never `--`.
 */
export const SLASH_SEPARATOR = '--';

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
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  zip: 'application/zip',
};

export function resolveContentType(key: string): string {
  const dotIndex = key.lastIndexOf('.');
  if (dotIndex === -1) return 'application/octet-stream';
  const ext = key.slice(dotIndex + 1).toLowerCase();
  return EXTENSION_MIME_TYPES[ext] ?? 'application/octet-stream';
}
