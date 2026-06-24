import { Injectable } from '@nestjs/common';
import { CrearContratoMedidorDto } from '../interfaces/dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../interfaces/dto/update-contrato-medidor.dto';
import { FilterContractsDto } from '../interfaces/dto/filter-contracts.dto';
import { buildContractFilters } from './mappers/build-contract-filters.mapper';
import { EstadoContrato } from 'src/shared/enums';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
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

  getContractStatesCatalog(): EnumStateDto[] {
    return buildStateCatalog(EstadoContrato, {
      [EstadoContrato.SOLICITUD]: 'Solicitud',
      [EstadoContrato.PENDIENTE_PAGO]: 'Pendiente Pago',
      [EstadoContrato.PENDIENTE_INSTALACION]: 'Pendiente Instalación',
      [EstadoContrato.ACTIVO]: 'Activo',
      [EstadoContrato.EN_MORA]: 'En Mora',
      [EstadoContrato.ORDEN_CORTE]: 'Orden Corte',
      [EstadoContrato.SUSPENDIDO]: 'Suspendido',
      [EstadoContrato.EN_CONVENIO]: 'En Convenio',
      [EstadoContrato.RETIRADO]: 'Retirado',
      [EstadoContrato.RECONEXION]: 'Reconexión',
    });
  }

  async crearContrato(createDto: CrearContratoMedidorDto): Promise<any> {
    return this.createContractUseCase.execute(createDto);
  }

  async buscarContratos(filters?: FilterContractsDto) {
    const contractFilters = filters ? buildContractFilters(filters) : undefined;
    return this.findAllUseCase.execute(filters?.page, filters?.limit, contractFilters);
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
