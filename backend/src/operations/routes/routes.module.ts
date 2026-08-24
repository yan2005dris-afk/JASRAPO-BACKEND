import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { RoutesService } from './application/routes.service';
import { RoutesController } from './interfaces/http/routes.controller';
import { GetEligibleReadingsUseCase } from './application/use-cases/get-eligible-readings.use-case';
import { GetReadingsByRutaUseCase } from './application/use-cases/get-readings-by-ruta.use-case';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './application/use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { ReassignRouteUseCase } from './application/use-cases/reassign-route.use-case';
import { ExportFieldSheetPdfUseCase } from './application/use-cases/export-field-sheet-pdf.use-case';
import { RepositoriesModule } from './repositories.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo.module';
import { FieldSheetPdfDocumentType } from './pdf/field-sheet.pdf-type';

@Module({
  imports: [RepositoriesModule, OrdenesTrabajoModule],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    GetEligibleReadingsUseCase,
    GetReadingsByRutaUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    ReassignRouteUseCase,
    ExportFieldSheetPdfUseCase,
  ],
  exports: [
    RepositoriesModule,
    RoutesService,
    GetEligibleReadingsUseCase,
    GetReadingsByRutaUseCase,
    CreateRouteUseCase,
    FindAllRoutesUseCase,
    FindOneRouteUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    ReassignRouteUseCase,
    ExportFieldSheetPdfUseCase,
    OrdenesTrabajoModule,
  ],
})
export class RoutesModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit(): void {
    this.pdfService.registerDocumentType(FieldSheetPdfDocumentType);
  }
}
