import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { ContratoMedidorService } from './application/contrato-medidor.service';
import { ContratoMedidorController } from './interfaces/http/contrato-medidor.controller';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { FindAllContractsUseCase } from './application/use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './application/use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './application/use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './application/use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './application/use-cases/finalize-meter-link.use-case';
import { GetConnectionRequestPdfDataUseCase } from './application/use-cases/get-connection-request-pdf-data.use-case';
import { GetResponsibilityAgreementPdfDataUseCase } from './application/use-cases/get-responsibility-agreement-pdf-data.use-case';
import { GetServiceAreaUseCase } from './application/use-cases/get-service-area.use-case';
import { ContractRepository } from './domain/repositories/contract.repository';
import { PrismaContractRepository } from './infrastructure/repositories/prisma-contract.repository';
import { ContractGuideGeneratorService } from './infrastructure/services/contract-guide-generator.service';
import { ConnectionRequestPdfDocumentType } from './pdf/connection-request.pdf-type';
import { ResponsibilityAgreementPdfDocumentType } from './pdf/responsibility-agreement.pdf-type';
import { RepositoriesModule } from '../routes/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [ContratoMedidorController],
  providers: [
    { provide: ContractRepository, useClass: PrismaContractRepository },
    ContractGuideGeneratorService,
    ContratoMedidorService,
    CreateContractUseCase,
    FindAllContractsUseCase,
    FindOneContractUseCase,
    UpdateContractUseCase,
    RemoveContractUseCase,
    FinalizeMeterLinkUseCase,
    GetConnectionRequestPdfDataUseCase,
    GetResponsibilityAgreementPdfDataUseCase,
    GetServiceAreaUseCase,
  ],
  exports: [
    ContractRepository,
    ContratoMedidorService,
    CreateContractUseCase,
    FindAllContractsUseCase,
    FindOneContractUseCase,
    UpdateContractUseCase,
    RemoveContractUseCase,
    FinalizeMeterLinkUseCase,
  ],
})
export class ContratoMedidorModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(ConnectionRequestPdfDocumentType);
    this.pdfService.registerDocumentType(
      ResponsibilityAgreementPdfDocumentType,
    );
  }
}
