import { PassThrough, type Readable } from 'node:stream';
import * as ExcelJS from 'exceljs';
import type { ColumnDefinition } from '../interfaces/export.interface';

export function createXlsxStream<T = any>(
  dataSource: AsyncIterable<T> | Readable | T[],
  columns: ColumnDefinition<T>[],
  options?: { sheetName?: string; signal?: AbortSignal },
): Readable {
  const passThrough = new PassThrough();

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: passThrough,
    useStyles: true,
    useSharedStrings: false,
  });

  const worksheet = workbook.addWorksheet(options?.sheetName || 'Reporte');

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: String(col.key),
    width: col.width || Math.max(col.header.length + 4, 14),
  }));

  // Style header row with professional corporate styling
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  headerRow.commit();

  void (async () => {
    try {
      const iterable = Array.isArray(dataSource)
        ? dataSource
        : (dataSource as any);

      for await (const item of iterable) {
        if (options?.signal?.aborted) {
          throw new Error('Export aborted by client');
        }

        const rowValues: Record<string, any> = {};
        for (const col of columns) {
          let val = item?.[col.key];
          if (col.transform) {
            val = col.transform(val, item);
          }
          if (typeof val === 'bigint') {
            val = val.toString();
          } else if (val instanceof Date) {
            val = val.toISOString().split('T')[0];
          }
          rowValues[String(col.key)] = val ?? '';
        }

        const row = worksheet.addRow(rowValues);
        row.commit();
      }

      worksheet.commit();
      await workbook.commit();
    } catch (err: any) {
      passThrough.destroy(err);
    }
  })();

  return passThrough;
}
