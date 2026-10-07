import { Injectable } from '@nestjs/common';
import { CrearContratoMedidorDto } from '../interfaces/dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../interfaces/dto/update-contrato-medidor.dto';
import { FilterContractsDto } from '../interfaces/dto/filter-contracts.dto';
import { buildContractFilters } from './mappers/build-contract-filters.mapper';
import { CreateContractUseCase } from './use-cases/create-contract.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';
import { GetConnectionRequestPdfDataUseCase } from './use-cases/get-connection-request-pdf-data.use-case';
import { GetResponsibilityAgreementPdfDataUseCase } from './use-cases/get-responsibility-agreement-pdf-data.use-case';
import { GetServiceAreaUseCase } from './use-cases/get-service-area.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ContractEntity } from '../domain/entities/contract.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { OrdenTrabajoRepository } from '../../routes/domain/repositories/orden-trabajo.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type { AssignInstallationRouteDto } from '../interfaces/dto/assign-installation-route.dto';
import { RouteEntity } from '../../routes/domain/entities/route.entity';
import type { IServiceArea } from '../domain/types/service-area.types';

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
    private readonly getServiceAreaUseCase: GetServiceAreaUseCase,
    private readonly generatePdf: GeneratePdfUseCase,
    private readonly routeRepository: RouteRepository,
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
  ) {}

  async crearContrato(
    createDto: CrearContratoMedidorDto,
    actorUserId?: number,
    userRole?: string,
  ): Promise<ContractEntity> {
    return this.createContractUseCase.execute(createDto, actorUserId, userRole);
  }

  async buscarContratos(
    filters?: FilterContractsDto,
  ): Promise<PaginatedResult<ContractEntity>> {
    const contractFilters = filters ? buildContractFilters(filters) : undefined;
    return this.findAllUseCase.execute(
      filters?.page,
      filters?.limit,
      contractFilters,
    );
  }

  async buscarContrato(id: bigint): Promise<ContractEntity> {
    return this.findOneUseCase.execute(id);
  }

  async actualizar(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<ContractEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async finalizarVinculo(id: bigint): Promise<ContractEntity> {
    return this.finalizeLinkUseCase.execute(id);
  }

  async eliminar(id: bigint): Promise<ContractEntity> {
    return this.removeUseCase.execute(id);
  }

  getServiceArea(): IServiceArea {
    return this.getServiceAreaUseCase.execute();
  }

  // ── Asignar contrato a ruta de instalación (SC-174) ─────────────────────

  async assignInstallationRoute(
    contratoId: bigint,
    dto: AssignInstallationRouteDto,
  ): Promise<RouteEntity> {
    const rutaId = await this.ordenTrabajoRepository.assignInstallationRoute(
      contratoId,
      dto.routeId != null ? BigInt(dto.routeId) : undefined,
    );
    const route = await this.routeRepository.findById(rutaId);
    if (!route) throw new EntityNotFoundException('Ruta', rutaId);
    return route;
  }

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
