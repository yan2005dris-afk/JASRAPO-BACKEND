import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Serializes Prisma `Decimal` instances as strings on the API wire.
 *
 * Replaces the historical `DecimalToNumberInterceptor`, which cast every
 * Decimal to a JavaScript `Number` and silently destroyed monetary precision
 * (e.g. `150.00` -> `150.00000000000003`). SRI reconciliation drifted by
 * cents across thousands of billing rows.
 *
 * Rules for this layer:
 * - API boundary serializes Decimal as string; UI layer handles formatting.
 * - Do NOT round here — SRI reconciliation requires lossless wire format.
 * - Do NOT call `toFixed(n)` — that hard-codes a scale and rounds. Clients
 *   pick their own formatting once they receive the string.
 * - The Decimal's own `toString()` returns the exact, canonical value (no
 *   float drift). Trailing-zero stripping by decimal.js is mathematically
 *   lossless (`'150.00'` -> `'150'` are the same number).
 */

function isDecimalLike(value: unknown): value is { toString(): string } {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value !== 'object') {
    return false;
  }
  const candidate = value as {
    constructor?: { name?: string };
    _isDecimal?: unknown;
  };
  if (candidate.constructor?.name === 'Decimal') {
    return true;
  }
  if (candidate._isDecimal) {
    return true;
  }
  return false;
}

function transformDecimals(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Map) {
    const result = new Map<string | number | symbol, unknown>();
    for (const [k, v] of value.entries()) {
      result.set(k, transformDecimals(v));
    }
    return result;
  }

  if (value instanceof Set) {
    return new Set(Array.from(value, (item) => transformDecimals(item)));
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformDecimals(item));
  }

  if (typeof value === 'object') {
    if (isDecimalLike(value)) {
      return (value as { toString(): string }).toString();
    }
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = transformDecimals(child);
    }
    return result;
  }

  return value;
}

@Injectable()
export class DecimalToStringInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => transformDecimals(data)));
  }
}
