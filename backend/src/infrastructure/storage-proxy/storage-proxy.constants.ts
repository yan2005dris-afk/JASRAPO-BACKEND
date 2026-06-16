/**
 * Base URL for the storage proxy controller.
 * Must match globalPrefix in main.ts ('api/v1') + controller path ('storage').
 *
 * S3 key slashes are encoded as '--' in URLs — the controller reverts them.
 * Example: avatars/uuid.webp → /api/v1/storage/profile-photos/avatars--uuid.webp
 */
export const STORAGE_PROXY_BASE = '/api/v1/storage';
