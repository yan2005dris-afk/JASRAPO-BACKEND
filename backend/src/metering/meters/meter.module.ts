import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { MeterService } from './application/meter.service';
import { MeterController } from './interfaces/http/meter.controller';
import { CreateMeterUseCase } from './application/use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './application/use-cases/find-one-meter.use-case';
import { FindAllMetersUseCase } from './application/use-cases/find-all-meters.use-case';
import { UpdateMeterUseCase } from './application/use-cases/update-meter.use-case';
import { RemoveMeterUseCase } from './application/use-cases/remove-meter.use-case';
import { ExportMetersUseCase } from './application/use-cases/export-meters.use-case';
import { ExportMetersPdfUseCase } from './application/use-cases/export-meters-pdf.use-case';
import { MeterRepository } from './domain/repositories/meter.repository';
import { PrismaMeterRepository } from './infrastructure/repositories/prisma-meter.repository';
import { MetersInventoryPdfDocumentType } from './pdf/meters-inventory.pdf-type';

@Module({
  controllers: [MeterController],
  providers: [
    {
      provide: MeterRepository,
      useClass: PrismaMeterRepository,
    },
    MeterService,
    CreateMeterUseCase,
    FindOneMeterUseCase,
    FindAllMetersUseCase,
    UpdateMeterUseCase,
    RemoveMeterUseCase,
    ExportMetersUseCase,
    ExportMetersPdfUseCase,
  ],
  exports: [MeterRepository, CreateMeterUseCase, FindOneMeterUseCase],
})
export class MeterModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit(): void {
    this.pdfService.registerDocumentType(MetersInventoryPdfDocumentType);
  }
}
