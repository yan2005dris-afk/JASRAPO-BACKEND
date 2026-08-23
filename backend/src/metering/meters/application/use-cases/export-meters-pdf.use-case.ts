import { Injectable } from '@nestjs/common';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ExportMetersUseCase } from './export-meters.use-case';
import { ExportMeterDto } from '../../interfaces/dto/export-meter.dto';
import { MetersInventoryPdfDocumentType } from '../../pdf/meters-inventory.pdf-type';

@Injectable()
export class ExportMetersPdfUseCase {
  constructor(
    private readonly exportMeters: ExportMetersUseCase,
    private readonly generatePdf: GeneratePdfUseCase,
  ) {}

  async execute(filters?: ExportMeterDto): Promise<Buffer> {
    const medidores = await this.exportMeters.execute(filters);
    return this.generatePdf.execute(MetersInventoryPdfDocumentType.type, {
      medidores,
      filtros: filters ?? {},
    });
  }
}
