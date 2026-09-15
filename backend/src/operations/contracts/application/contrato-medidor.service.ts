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
import { ContractEntity } from '../domain/entities/contract.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ActivityTypeCodes, EstadoRuta } from 'src/shared/enums';
import { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { OrdenTrabajoRepository } from '../../routes/domain/repositories/orden-trabajo.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';
import type { AssignInstallationRouteDto } from '../interfaces/dto/assign-installation-route.dto';
import { RouteEntity } from '../../routes/domain/entities/route.entity';

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
    private readonly routeRepository: RouteRepository,
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
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

  async crearContrato(
    createDto: CrearContratoMedidorDto,
  ): Promise<ContractEntity> {
    return this.createContractUseCase.execute(createDto);
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

  // ── Asignar contrato a ruta de instalación (SC-174) ─────────────────────

  /**
   * Asigna un contrato en estado PENDIENTE_INSTALACION a una ruta de
   * instalacion. Si `dto.routeId` es null/undefined, crea una nueva ruta
   * INSTALACION sin operario asignado. Si se pasa `dto.routeId`, valida
   * que la ruta destino sea de tipo INSTALACION y este en PENDIENTE.
   *
   * En ambos casos crea una orden_trabajo (INSTALACION) para el contrato
   * y la vincula a la ruta (nueva o existente).
   */
  async assignInstallationRoute(
    contratoId: bigint,
    dto: AssignInstallationRouteDto,
  ): Promise<RouteEntity> {
    // 1. Buscar el contrato y validar estado
    const contrato = await this.findOneUseCase.execute(contratoId);

    if (contrato.estado !== EstadoContrato.PENDIENTE_INSTALACION) {
      throw new InvalidDomainOperationException(
        `El contrato debe estar en estado PENDIENTE_INSTALACION (actual: ${contrato.estado})`,
      );
    }

    // 2. Resolver la ruta (crear nueva o usar existente)
    let ruta: RouteEntity;

    if (dto.routeId !== undefined && dto.routeId !== null) {
      const existing = await this.routeRepository.findById(BigInt(dto.routeId));
      if (!existing) {
        throw new EntityNotFoundException('Ruta', dto.routeId.toString());
      }
      if (existing.tipoRuta !== ActivityTypeCodes.INSTALACION) {
        throw new InvalidDomainOperationException(
          `La ruta debe ser de tipo INSTALACION (actual: ${existing.tipoRuta})`,
        );
      }
      if (existing.estado !== EstadoRuta.PENDIENTE) {
        throw new InvalidDomainOperationException(
          `La ruta debe estar en estado PENDIENTE (actual: ${existing.estado})`,
        );
      }
      ruta = existing;
    } else {
      // Crear nueva ruta INSTALACION sin operario
      ruta = await this.routeRepository.create({
        nombre: `Instalaciones ${contrato.numeroGuia ?? contratoId}`,
        descripcion: null,
        operarioId: null,
        tipoRuta: ActivityTypeCodes.INSTALACION,
        comunidadId: Number(contrato.comunidadId),
        sectorId: null,
        periodoId: null,
        estado: EstadoRuta.PENDIENTE,
        fechaPlanificada: dto.fechaPlanificada
          ? DateUtil.parseFrontendDate(dto.fechaPlanificada)
          : null,
      });
    }

    // 3. Crear la orden_trabajo vinculada al contrato
    await this.ordenTrabajoRepository.create({
      rutaId: ruta.rutaId,
      contratoId,
      medidorId: contrato.historialMedidores?.[0]?.medidorId ?? null,
      tipoActividad: 'INSTALACION',
      estado: 'PENDIENTE',
    });

    return ruta;
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
