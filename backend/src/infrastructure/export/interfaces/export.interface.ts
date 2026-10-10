import type { Readable } from 'node:stream';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ColumnDefinition<T = unknown> {
  header: string;
  key: keyof T | string;
  width?: number;
  transform?: (
    value: unknown,
    row: T,
  ) => string | number | boolean | Date | null | undefined;
}

export interface StreamExportOptions<T = unknown> {
  filename: string;
  format: 'csv' | 'xlsx';
  columns: ColumnDefinition<T>[];
  dataSource: AsyncIterable<T> | Readable | T[];
  sheetName?: string;
  signal?: AbortSignal;
}

export interface StreamExportResult {
  stream: Readable;
  contentType: string;
  filename: string;
}
