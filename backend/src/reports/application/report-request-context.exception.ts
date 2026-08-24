import { HttpException, HttpStatus } from '@nestjs/common';
import {
  summarizeReportRequestContext,
  type ReportRequestContext,
} from './models/report-request-context';

export class ReportRequestContextException extends HttpException {
  constructor(error: unknown, context: ReportRequestContext) {
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const originalResponse =
      error instanceof HttpException ? error.getResponse() : undefined;
    const response =
      typeof originalResponse === 'object' && originalResponse !== null
        ? originalResponse
        : {
            statusCode: status,
            message:
              status === 500
                ? 'Report generation failed'
                : String(originalResponse ?? 'Report request failed'),
          };

    super(
      {
        ...response,
        reportContext: summarizeReportRequestContext(context),
      },
      status,
      { cause: error instanceof Error ? error : undefined },
    );
  }
}
