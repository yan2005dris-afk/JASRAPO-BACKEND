import { normalizeContractProcedure } from '../../domain/contract-procedure';
import { Injectable } from '@nestjs/common';
import { ContractState } from '../../domain/contract-state';
import { EstadoServicioContrato } from 'src/shared/enums';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { CrearContratoMedidorDto } from '../../interfaces/dto/create-contrato-medidor.dto';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import { validateServiceAreaLocation } from '../../domain/policies/service-area.policy';
import { DomainValidationException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    dto: CrearContratoMedidorDto,
    actorUserIdOrRole?: number | string,
    userRole?: string,
  ): Promise<ContractRow> {
    const actorUserId =
      typeof actorUserIdOrRole === 'number' ? actorUserIdOrRole : undefined;
    const effectiveRole =
      typeof actorUserIdOrRole === 'string' ? actorUserIdOrRole : userRole;

    if (dto.latitud != null && dto.longitud != null) {
      const locationError = validateServiceAreaLocation(
        dto.latitud,
        dto.longitud,
      );
      if (locationError) {
        throw new DomainValidationException(locationError);
      }
    }

    const estadoServicio = EstadoServicioContrato.PENDIENTE_INSPECCION;
    const estadoCobranza = ContractState.normalizeCollectionStatus(
      dto.estadoCobranza,
      estadoServicio,
    );

    // Solo admin/superadmin puede definir lecturaInicial; para otros roles se fuerza a 0
    const isAdmin =
      effectiveRole?.toLowerCase() === 'admin' ||
      effectiveRole?.toLowerCase() === 'superadmin';
    const lecturaInicial =
      isAdmin && dto.lecturaInicial !== undefined ? dto.lecturaInicial : 0;

    return this.contractRepository.createContractWithMeterHistory({
      ...normalizeContractProcedure(dto),
      ...(actorUserId !== undefined ? { registradoPorId: actorUserId } : {}),
      clienteId: BigInt(dto.clienteId),
      categoriaTarifaId: Number(dto.categoriaTarifaId),
      medidorId: BigInt(dto.medidorId),
      comunidadId: Number(dto.comunidadId),
      sectorId: dto.sectorId ? Number(dto.sectorId) : null,
      direccionSuministro: dto.direccionSuministro,
      estadoServicio,
      estadoCobranza,
      creadoPor:
        actorUserId !== undefined ? String(actorUserId) : dto.creadoPor,
      lecturaInicial,
      latitud: dto.latitud,
      longitud: dto.longitud,
    });
  }
}
