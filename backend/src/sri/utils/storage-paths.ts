import { resolve } from 'path';
import { requireEnv, resolveDir, ensureDir } from '../../infrastructure/common/utils/env.utils';

/**
 * Local filesystem storage paths (deprecated in favor of MinIO)
 *
 * @deprecated These paths are maintained for backward compatibility and fallback scenarios.
 * New code should use MinIO storage via IStorageService. The StorageServiceFactory
 * automatically handles the selection between MinIO and filesystem.
 *
 * Current usage (still needed for):
 * - PDF generation endpoints (write to local disk before serving)
 * - Certificate operations (signing requires local certs)
 * - Status checks (reads filesystem for health monitoring)
 *
 * Migration status:
 * - XML: Migrated to MinIO (sri-xmls bucket)
 * - Templates: Migrated to MinIO (sri-templates bucket)
 * - PDFs (upload): Migrated to MinIO (sri-pdfs bucket)
 * - Images (upload): Migrated to MinIO (sri-images bucket)
 * - PDFs (generation): Still uses local filesystem
 */
export const STORAGE_PATHS = {
  get templates(): string {
    const dir = resolveDir(requireEnv('TEMPLATES_DIR'));
    ensureDir(dir);
    return dir;
  },
  get pdfs(): string {
    const dir = resolveDir(requireEnv('PDFS_DIR'));
    ensureDir(dir);
    return dir;
  },
  get certs(): string {
    const dir = resolveDir(requireEnv('CERTS_DIR'));
    ensureDir(dir);
    return dir;
  },
  get pdfsConFirma(): string {
    const dir = resolve(this.pdfs, 'con_firma');
    ensureDir(dir);
    return dir;
  },
  get pdfsOthers(): string {
    const dir = resolve(this.pdfs, 'others');
    ensureDir(dir);
    return dir;
  },
  get pdfsDocuments(): string {
    const dir = resolve(this.pdfs, 'documents');
    ensureDir(dir);
    return dir;
  },
  get pdfsImages(): string {
    const dir = resolve(this.pdfs, 'images');
    ensureDir(dir);
    return dir;
  },
};

// Generic filename utilities (sanitizeFilename, generateUniqueFilename)
// have been moved to src/infrastructure/common/utils/file.utils.ts
