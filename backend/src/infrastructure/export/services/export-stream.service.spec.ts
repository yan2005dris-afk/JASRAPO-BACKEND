import { ExportStreamService } from './export-stream.service';
import type { ColumnDefinition } from '../interfaces/export.interface';

describe('ExportStreamService', () => {
  let service: ExportStreamService;

  beforeEach(() => {
    service = new ExportStreamService();
  });

  it('should create CSV export stream with correct headers and content type', async () => {
    const columns: ColumnDefinition[] = [
      { header: 'Cliente', key: 'nombre' },
      { header: 'Saldo', key: 'saldo' },
    ];
    const data = [{ nombre: 'Carlos Ruiz', saldo: 50.25 }];

    const result = service.createExportStream({
      filename: 'reporte-clientes',
      format: 'csv',
      columns,
      dataSource: data,
    });

    expect(result.contentType).toBe('text/csv; charset=utf-8');
    expect(result.filename).toBe('reporte-clientes.csv');

    const chunks: Buffer[] = [];
    for await (const chunk of result.stream) {
      chunks.push(Buffer.from(chunk));
    }
    const output = Buffer.concat(chunks).toString('utf-8');
    expect(output).toContain('Carlos Ruiz,50.25');
  });

  it('should create XLSX export stream with correct spreadsheetml content type', async () => {
    const columns: ColumnDefinition[] = [
      { header: 'Cliente', key: 'nombre' },
      { header: 'Saldo', key: 'saldo' },
    ];
    const data = [{ nombre: 'Carlos Ruiz', saldo: 50.25 }];

    const result = service.createExportStream({
      filename: 'reporte-clientes',
      format: 'xlsx',
      columns,
      dataSource: data,
    });

    expect(result.contentType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(result.filename).toBe('reporte-clientes.xlsx');

    const chunks: Buffer[] = [];
    for await (const chunk of result.stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    expect(buffer.length).toBeGreaterThan(100);
    // Standard ZIP/XLSX magic bytes (PK\x03\x04)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });
});
