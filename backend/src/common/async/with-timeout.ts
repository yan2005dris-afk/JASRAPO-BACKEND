/**
 * PR 4 — generic timeout helper for async operations.
 *
 * `withTimeout(promise, ms, label)` races the supplied promise against a
 * timer. If the promise settles first, its result or rejection is returned
 * untouched. If the timer fires first, the returned promise rejects with a
 * `TimeoutError` carrying the supplied `label` and the configured `ms`.
 *
 * The timer is always cleared on the success path so we don't leak pending
 * timers into the event loop.
 *
 * Design rationale (see engram `sdd/report-endpoint-send-email/design`
 * revision 2, decision #6): Puppeteer's `page.pdf(...)` does not propagate
 * a timeout option from `GeneratePdfUseCase`; rather than thread a timeout
 * through the PDF use case, the report-email use case wraps the call in
 * `withTimeout` and converts the resulting `TimeoutError` into a 503
 * (transient failure, retryable). This keeps the PDF use case unchanged.
 */
export class TimeoutError extends Error {
  constructor(
    public readonly label: string,
    public readonly timeoutMs: number,
  ) {
    super(`Operation '${label}' timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
