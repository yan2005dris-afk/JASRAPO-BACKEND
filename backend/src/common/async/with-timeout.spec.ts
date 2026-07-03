/**
 * PR 4 — `withTimeout` helper unit tests.
 *
 * Spec scenarios (from orchestrator PR 4 brief):
 *   1. resolves within time
 *   2. rejects after timeout
 *   3. original rejection propagates
 *   4. error includes the `label`
 *
 * Strict TDD: tests written before production code. Production code lives
 * in `backend/src/common/async/with-timeout.ts` and does NOT exist yet.
 */
import { TimeoutError, withTimeout } from './with-timeout';

describe('withTimeout', () => {
  // 1) resolves within time
  it('resolves with the original value when the promise resolves before the timeout', async () => {
    const result = await withTimeout(Promise.resolve('payload'), 50, 'fast-op');
    expect(result).toBe('payload');
  });

  // 2) rejects after timeout
  it('rejects with a TimeoutError when the promise does not resolve in time', async () => {
    const slow = new Promise<string>((resolve) => {
      setTimeout(() => resolve('too-late'), 200);
    });

    await expect(withTimeout(slow, 20, 'slow-op')).rejects.toBeInstanceOf(
      TimeoutError,
    );
  });

  // 3) original rejection propagates
  it('propagates the original rejection when the promise rejects before the timeout', async () => {
    const originalError = new Error('upstream failure');
    await expect(
      withTimeout(Promise.reject(originalError), 100, 'flaky-op'),
    ).rejects.toBe(originalError);
  });

  // 4) error includes the label
  it('includes the supplied label in the TimeoutError message', async () => {
    const slow = new Promise<string>((resolve) => {
      setTimeout(() => resolve('nope'), 100);
    });

    try {
      await withTimeout(slow, 10, 'pdf-generation');
      fail('Expected withTimeout to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(TimeoutError);
      expect((err as TimeoutError).label).toBe('pdf-generation');
      expect((err as Error).message).toContain('pdf-generation');
    }
  });

  // Triangulation: an already-resolved promise should resolve immediately,
  // even with a zero (or near-zero) timeout. Forces the helper to handle
  // the "promise wins the race" path correctly without depending on timers.
  it('resolves immediately when the promise is already settled', async () => {
    const result = await withTimeout(Promise.resolve(42), 0, 'instant-op');
    expect(result).toBe(42);
  });

  // Triangulation: clears the timer when the underlying promise wins so we
  // don't leak pending timers into the event loop.
  it('clears the timer when the underlying promise resolves first', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    await withTimeout(Promise.resolve('ok'), 5000, 'never-fires');
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
