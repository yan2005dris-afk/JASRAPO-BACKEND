import { Transform, type TransformCallback } from 'node:stream';
import type { ColumnDefinition } from '../interfaces/export.interface';

export class CsvStreamTransformer<T = any> extends Transform {
  private isFirstChunk = true;

  constructor(
    private readonly columns: ColumnDefinition<T>[],
    private readonly options?: { signal?: AbortSignal },
  ) {
    super({ objectMode: true });

    if (this.options?.signal) {
      if (this.options.signal.aborted) {
        this.destroy(new Error('Export aborted by client'));
      } else {
        this.options.signal.addEventListener(
          'abort',
          () => {
            this.destroy(new Error('Export aborted by client'));
          },
          { once: true },
        );
      }
    }
  }

  _transform(
    chunk: T,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    try {
      if (this.isFirstChunk) {
        this.isFirstChunk = false;
        // UTF-8 BOM for Excel compatibility with accents/special characters
        const headerRow = this.columns
          .map((col) => this.sanitizeAndEscapeCell(col.header))
          .join(',');
        this.push(`\uFEFF${headerRow}\r\n`);
      }

      const rowValues = this.columns.map((col) => {
        let rawVal = (chunk as any)?.[col.key];
        if (col.transform) {
          rawVal = col.transform(rawVal, chunk);
        }
        return this.formatAndSanitizeValue(rawVal);
      });

      this.push(`${rowValues.join(',')}\r\n`);
      callback();
    } catch (error: any) {
      callback(error);
    }
  }

  _flush(callback: TransformCallback): void {
    if (this.isFirstChunk) {
      // If dataset was completely empty, still emit header
      const headerRow = this.columns
        .map((col) => this.sanitizeAndEscapeCell(col.header))
        .join(',');
      this.push(`\uFEFF${headerRow}\r\n`);
    }
    callback();
  }

  private formatAndSanitizeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.sanitizeAndEscapeCell(value.toISOString());
    }

    if (typeof value === 'bigint') {
      return this.sanitizeAndEscapeCell(value.toString());
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (typeof value === 'string') {
      return this.sanitizeAndEscapeCell(value);
    }

    if (typeof value === 'object') {
      if (
        'toFixed' in (value as any) &&
        typeof (value as any).toFixed === 'function'
      ) {
        return (value as any).toString();
      }
      return this.sanitizeAndEscapeCell(JSON.stringify(value));
    }

    return this.sanitizeAndEscapeCell(String(value as any));
  }

  private sanitizeAndEscapeCell(value: string): string {
    let sanitized = value;

    // CSV Formula Injection Prevention (=, +, -, @, \t, \r)
    const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
    if (dangerousPrefixes.some((p) => sanitized.startsWith(p))) {
      sanitized = `'${sanitized}`;
    }

    // Escape double quotes
    const needsQuotes =
      sanitized.includes(',') ||
      sanitized.includes('"') ||
      sanitized.includes('\n') ||
      sanitized.includes('\r');

    if (needsQuotes) {
      sanitized = `"${sanitized.replace(/"/g, '""')}"`;
    }

    return sanitized;
  }
}
