import type { Response } from 'express';

export interface PdfRequestAbortHandle {
  signal: AbortSignal;
  dispose(): void;
}

/**
 * Bridges an aborted/disconnected HTTP request to the PDF runtime. The close
 * event is ignored after a response completed normally.
 */
export function observePdfRequestAbort(
  response: Response,
): PdfRequestAbortHandle {
  const controller = new AbortController();
  const request = response.req;
  const onAborted = () => controller.abort();
  const onClose = () => {
    if (!response.writableEnded) controller.abort();
  };

  request.once('aborted', onAborted);
  response.once('close', onClose);

  return {
    signal: controller.signal,
    dispose: () => {
      request.removeListener('aborted', onAborted);
      response.removeListener('close', onClose);
    },
  };
}
