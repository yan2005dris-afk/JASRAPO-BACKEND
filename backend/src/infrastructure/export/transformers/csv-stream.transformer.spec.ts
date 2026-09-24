import { Readable } from 'node:stream';
import { CsvStreamTransformer } from './csv-stream.transformer';
import type { ColumnDefinition } from '../interfaces/export.interface';

describe('CsvStreamTransformer', () => {
  it('should format CSV with UTF-8 BOM, headers, and rows', async () => {
    const columns: ColumnDefinition[] = [
      { header: 'ID', key: 'id' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Monto', key: 'monto' },
    ];

    const data = [
      { id: BigInt(1), nombre: 'Juan Pérez', monto: 125.5 },
      { id: BigInt(2), nombre: 'María López', monto: 300.0 },
    ];

    const transformer = new CsvStreamTransformer(columns);
    const stream = Readable.from(data).pipe(transformer);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const output = Buffer.concat(chunks).toString('utf-8');

    expect(output.startsWith('\uFEFF')).toBe(true);
    expect(output).toContain('ID,Nombre,Monto');
    expect(output).toContain('1,Juan Pérez,125.5');
    expect(output).toContain('2,María López,300');
  });

  it('should sanitize CSV formula injection prefixes (=, +, -, @)', async () => {
    const columns: ColumnDefinition[] = [
      { header: 'Fórmula Peligrosa', key: 'formula' },
    ];

    const data = [
      { formula: '=1+1' },
      { formula: '+cmd|' },
      { formula: '-2+5' },
      { formula: '@SUM(A1:A10)' },
    ];

    const transformer = new CsvStreamTransformer(columns);
    const stream = Readable.from(data).pipe(transformer);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const output = Buffer.concat(chunks).toString('utf-8');

    expect(output).toContain("'=1+1");
    expect(output).toContain("'+cmd|");
    expect(output).toContain("'-2+5");
    expect(output).toContain("'@SUM(A1:A10)");
  });

  it('should escape double quotes and wrap cells with commas or newlines', async () => {
    const columns: ColumnDefinition[] = [{ header: 'Texto', key: 'texto' }];

    const data = [
      { texto: 'Texto con "comillas"' },
      { texto: 'Texto, con coma' },
      { texto: 'Texto\ncon salto' },
    ];

    const transformer = new CsvStreamTransformer(columns);
    const stream = Readable.from(data).pipe(transformer);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const output = Buffer.concat(chunks).toString('utf-8');

    expect(output).toContain('"Texto con ""comillas"""');
    expect(output).toContain('"Texto, con coma"');
    expect(output).toContain('"Texto\ncon salto"');
  });
});
