import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Strips audit fields (createdAt, updatedAt, deletedAt) from all API responses.
 *
 * These are internal tracking fields that should never reach the frontend.
 * Applied globally once in main.ts — no per-controller boilerplate needed.
 *
 * Handles:
 * - Plain objects
 * - Arrays of objects
 * - Paginated responses ({ data: [...], meta: {...} })
 * - Nested objects
 * - Date objects (preserved as-is since they're not audit fields)
 */
@Injectable()
export class AuditFieldsInterceptor implements NestInterceptor {
  private readonly FIELDS_TO_REMOVE = new Set([
    'createdAt',
    'updatedAt',
    'deletedAt',
  ]);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.strip(data)));
  }

  private strip(value: unknown): unknown {
    // Primitives, null, undefined, Dates → return as-is
    if (value === null || value === undefined || typeof value !== 'object') {
      return value;
    }

    if (
      value instanceof Date ||
      value instanceof RegExp ||
      value instanceof StreamableFile
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.strip(item));
    }

    // PaginatedResponse shape { data: [...], meta: {...} }
    const obj = value as Record<string, unknown>;
    if ('data' in obj && Array.isArray(obj.data) && 'meta' in obj) {
      return {
        ...obj,
        data: obj.data.map((item) => this.strip(item)),
      };
    }

    // Plain object — omit audit fields, recurse into values
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (!this.FIELDS_TO_REMOVE.has(key)) {
        result[key] = this.strip(obj[key]);
      }
    }
    return result;
  }
}
