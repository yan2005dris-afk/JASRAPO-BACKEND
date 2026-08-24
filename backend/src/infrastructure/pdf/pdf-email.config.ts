import { readPositiveInteger } from './pdf-config.utils';

export const getPdfEmailMaxAttachmentBytes = (): number =>
  readPositiveInteger(
    process.env['PDF_EMAIL_MAX_ATTACHMENT_BYTES'],
    10 * 1024 * 1024,
  );

export const getPdfEmailIdempotencySeconds = (): number =>
  readPositiveInteger(
    process.env['PDF_EMAIL_IDEMPOTENCY_SECONDS'],
    24 * 60 * 60,
  );

export const getPdfEmailJobTimeoutSeconds = (): number =>
  readPositiveInteger(process.env['PDF_EMAIL_JOB_TIMEOUT_SECONDS'], 120);
