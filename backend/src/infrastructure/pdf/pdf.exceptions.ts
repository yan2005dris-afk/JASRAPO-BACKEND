import {
  HttpException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';

export class PdfQueueSaturatedException extends ServiceUnavailableException {
  constructor(retryAfterSeconds: number) {
    super({
      statusCode: 503,
      code: 'PDF_QUEUE_SATURATED',
      message: 'PDF generation capacity is temporarily saturated',
      retryable: true,
      retryAfterSeconds,
    });
  }
}

export class PdfGenerationTimeoutException extends ServiceUnavailableException {
  constructor(timeoutMs: number) {
    super({
      statusCode: 503,
      code: 'PDF_GENERATION_TIMEOUT',
      message: `PDF generation exceeded the total ${timeoutMs}ms budget`,
      retryable: true,
    });
  }
}

export class PdfRequestCancelledException extends HttpException {
  constructor() {
    super(
      {
        statusCode: 499,
        code: 'PDF_REQUEST_CANCELLED',
        message: 'PDF generation was cancelled by the client',
        retryable: true,
      },
      499,
    );
  }
}

export class PdfAttachmentTooLargeException extends PayloadTooLargeException {
  constructor(actualBytes: number, maxBytes: number) {
    super({
      statusCode: 413,
      code: 'PDF_ATTACHMENT_TOO_LARGE',
      message: `PDF attachment is ${actualBytes} bytes; maximum is ${maxBytes} bytes`,
      retryable: false,
      actualBytes,
      maxBytes,
    });
  }
}
