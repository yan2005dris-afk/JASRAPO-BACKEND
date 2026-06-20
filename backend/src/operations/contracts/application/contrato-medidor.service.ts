import { Injectable } from '@nestjs/common';
import { CrearContratoMedidorDto } from '../interfaces/dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../interfaces/dto/update-contrato-medidor.dto';
import { EstadoContrato } from 'src/shared/enums';
import { CreateContractUseCase } from './use-cases/create-contract.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';
import { GetConnectionRequestPdfDataUseCase } from './use-cases/get-connection-request-pdf-data.use-case';
import { GetResponsibilityAgreementPdfDataUseCase } from './use-cases/get-responsibility-agreement-pdf-data.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';

@Injectable()
export class ContratoMedidorService {
  constructor(
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly findAllUseCase: FindAllContractsUseCase,
    private readonly findOneUseCase: FindOneContractUseCase,
    private readonly updateUseCase: UpdateContractUseCase,
    private readonly removeUseCase: RemoveContractUseCase,
    private readonly finalizeLinkUseCase: FinalizeMeterLinkUseCase,
    private readonly getConnectionRequestPdfDataUseCase: GetConnectionRequestPdfDataUseCase,
    private readonly getResponsibilityAgreementPdfDataUseCase: GetResponsibilityAgreementPdfDataUseCase,
    private readonly generatePdf: GeneratePdfUseCase,
  ) {}

  getContractStatesCatalog(): { key: string; value: string }[] {
    return Object.entries(EstadoContrato).map(([key, value]) => ({
      key,
      value,
    }));
  }

  async crearContrato(createDto: CrearContratoMedidorDto): Promise<any> {
    return this.createContractUseCase.execute(createDto);
  }

  async buscarContratos(page = 1, limit = 10, where?: Record<string, any>) {
    return this.findAllUseCase.execute(page, limit, where);
  }

  async buscarContrato(id: bigint): Promise<any> {
    return this.findOneUseCase.execute(id);
  }

  async actualizar(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async finalizarVinculo(id: bigint): Promise<any> {
    return this.finalizeLinkUseCase.execute(id);
  }

  async eliminar(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }

  // ── PDF ──────────────────────────────────────────────────────────────────

  async generateConnectionRequestPdf(contratoId: bigint): Promise<Buffer> {
    const raw =
      await this.getConnectionRequestPdfDataUseCase.execute(contratoId);
    return this.generatePdf.execute('connection-request', raw as any);
  }

  async generateResponsibilityAgreementPdf(
    contratoId: bigint,
  ): Promise<Buffer> {
    const raw =
      await this.getResponsibilityAgreementPdfDataUseCase.execute(contratoId);
    return this.generatePdf.execute('responsibility-agreement', raw as any);
  }
}
