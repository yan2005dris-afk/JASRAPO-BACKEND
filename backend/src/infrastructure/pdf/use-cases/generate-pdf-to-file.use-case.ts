import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { GeneratePdfUseCase } from './generate-pdf.use-case';

@Injectable()
export class GeneratePdfToFileUseCase {
  constructor(private readonly generatePdf: GeneratePdfUseCase) {}

  async execute(type: string, raw: Record<string, unknown>, filename: string): Promise<string> {
    const buffer = await this.generatePdf.execute(type, raw);
    const filePath = path.join(os.tmpdir(), `${filename}.pdf`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }
}
