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
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ContractEntity } from '../domain/entities/contract.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import {
  EstadoOrdenTrabajo,
  EstadoRuta,
  EstadoServicioContrato,
  TipoActividadCodes,
} from 'src/shared/enums';
import { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { OrdenTrabajoRepository } from '../../routes/domain/repositories/orden-trabajo.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
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
   * Asigna (o reasigna) un contrato en estado PENDIENTE_INSTALACION a una ruta
   * de instalación.
   *
   * - Si el contrato NO tiene una orden de instalación activa, crea la orden en
   *   la ruta indicada (o en una ruta INSTALACION nueva sin operario).
   * - Si YA tiene una orden PENDIENTE, la reasigna a la nueva ruta sin duplicar
   *   registros; la ruta origen se limpia si queda huérfana.
   * - Si la orden/ruta ya está EN_PROGRESO o COMPLETADA, la operación se bloquea.
   */
  async assignInstallationRoute(
    contratoId: bigint,
    dto: AssignInstallationRouteDto,
  ): Promise<RouteEntity> {
    // 1. Buscar el contrato y validar estado
    const contrato = await this.findOneUseCase.execute(contratoId);

    if (
      contrato.estadoServicio !== EstadoServicioContrato.PENDIENTE_INSTALACION
    ) {
      throw new InvalidDomainOperationException(
        `El contrato debe estar en estado PENDIENTE_INSTALACION (actual: ${contrato.estadoServicio})`,
      );
    }

    // 2. Verificar si ya existe una orden de instalación activa para evitar
    //    duplicados. Según su estado se bloquea o se habilita la reasignación.
    const ordenActiva =
      await this.ordenTrabajoRepository.findActiveInstallationByContratoId(
        contratoId,
      );

    if (ordenActiva) {
      if (ordenActiva.estado === EstadoOrdenTrabajo.COMPLETADA) {
        throw new InvalidDomainOperationException(
          'La instalación ya ha sido completada.',
        );
      }
      if (ordenActiva.estado === EstadoOrdenTrabajo.EN_PROGRESO) {
        throw new InvalidDomainOperationException(
          'La orden de instalación ya se encuentra en progreso y no puede ser reasignada.',
        );
      }

      // Orden PENDIENTE: bloquear también si la ruta de origen ya inició.
      const rutaActual = await this.routeRepository.findById(
        ordenActiva.rutaId,
      );
      if (rutaActual && rutaActual.estado === EstadoRuta.EN_PROGRESO) {
        throw new InvalidDomainOperationException(
          'La orden de instalación ya se encuentra en progreso y no puede ser reasignada.',
        );
      }
    }

    // 3. Resolver la ruta destino (crear nueva o usar existente)
    let ruta: RouteEntity;

    if (dto.routeId !== undefined && dto.routeId !== null) {
      const existing = await this.routeRepository.findById(BigInt(dto.routeId));
      if (!existing) {
        throw new EntityNotFoundException('Ruta', dto.routeId.toString());
      }
      if (existing.tipoRuta !== TipoActividadCodes.INSTALACION) {
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
        tipoRuta: TipoActividadCodes.INSTALACION,
        comunidadId: Number(contrato.comunidadId),
        sectorId: null,
        periodoId: null,
        estado: EstadoRuta.PENDIENTE,
      });
    }

    // 4. Reasignar la orden existente o crear una nueva (primera asignación).
    if (ordenActiva) {
      await this.ordenTrabajoRepository.reassignInstallationOrder(
        ordenActiva.ordenTrabajoId,
        ruta.rutaId,
      );
    } else {
      await this.ordenTrabajoRepository.create({
        rutaId: ruta.rutaId,
        contratoId,
        medidorId: contrato.historialMedidores?.[0]?.medidorId ?? null,
        estado: EstadoOrdenTrabajo.PENDIENTE,
      });
    }

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
