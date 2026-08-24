import {
  readNonNegativeInteger,
  readPositiveInteger,
} from './pdf-config.utils';

export const PDF_RUNTIME_OPTIONS = Symbol('PDF_RUNTIME_OPTIONS');

export interface PdfRuntimeOptions {
  concurrency: number;
  maxQueueSize: number;
  totalTimeoutMs: number;
  retryAfterSeconds: number;
}

export const buildPdfRuntimeOptions = (): PdfRuntimeOptions => ({
  concurrency: readPositiveInteger(process.env['PDF_CONCURRENCY'], 4),
  maxQueueSize: readNonNegativeInteger(process.env['PDF_MAX_QUEUE_SIZE'], 32),
  totalTimeoutMs: readPositiveInteger(
    process.env['PDF_TOTAL_TIMEOUT_MS'] ?? process.env['PDF_TIMEOUT_MS'],
    30_000,
  ),
  retryAfterSeconds: readPositiveInteger(
    process.env['PDF_RETRY_AFTER_SECONDS'],
    5,
  ),
});
