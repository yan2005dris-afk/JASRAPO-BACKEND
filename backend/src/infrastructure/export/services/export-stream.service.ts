import { Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';
import type {
  StreamExportOptions,
  StreamExportResult,
} from '../interfaces/export.interface';
import { CsvStreamTransformer } from '../transformers/csv-stream.transformer';
import { createXlsxStream } from '../transformers/xlsx-stream.transformer';

@Injectable()
export class ExportStreamService {
  createExportStream<T = any>(
    options: StreamExportOptions<T>,
  ): StreamExportResult {
    const format = options.format;
    const baseFilename = options.filename.replace(/\.(csv|xlsx)$/i, '');

    if (format === 'csv') {
      const transformer = new CsvStreamTransformer<T>(options.columns, {
        signal: options.signal,
      });

      let sourceStream: Readable;
      if (Array.isArray(options.dataSource)) {
        sourceStream = Readable.from(options.dataSource);
      } else if (options.dataSource instanceof Readable) {
        sourceStream = options.dataSource;
      } else {
        sourceStream = Readable.from(options.dataSource);
      }

      const stream = sourceStream.pipe(transformer);

      return {
        stream,
        contentType: 'text/csv; charset=utf-8',
        filename: `${baseFilename}.csv`,
      };
    }

    if (format === 'xlsx') {
      const stream = createXlsxStream<T>(options.dataSource, options.columns, {
        sheetName: options.sheetName,
        signal: options.signal,
      });

      return {
        stream,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${baseFilename}.xlsx`,
      };
    }

    throw new Error(`Unsupported export format: ${String(format)}`);
  }
}
