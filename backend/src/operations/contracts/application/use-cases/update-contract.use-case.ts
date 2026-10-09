import { normalizeContractProcedure } from '../../domain/contract-procedure';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ActualizarContratoMedidorDto } from '../../interfaces/dto/update-contrato-medidor.dto';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import { ContractState } from '../../domain/contract-state';
import { validateServiceAreaLocation } from '../../domain/policies/service-area.policy';
import {
  DomainValidationException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<ContractRow> {
    const registro = await this.contractRepository.findById(id);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', id.toString());
    }

    const regLat =
      registro.latitud !== null && registro.latitud !== undefined
        ? Number(registro.latitud)
        : null;
    const regLng =
      registro.longitud !== null && registro.longitud !== undefined
        ? Number(registro.longitud)
        : null;
    const coordinatesChanged =
      updateDto.latitud !== regLat || updateDto.longitud !== regLng;
    if (
      updateDto.latitud != null &&
      updateDto.longitud != null &&
      coordinatesChanged
    ) {
      const locationError = validateServiceAreaLocation(
        updateDto.latitud,
        updateDto.longitud,
      );
      if (locationError) {
        throw new DomainValidationException(locationError);
      }
    }

    const updateData = this.extractFields(updateDto, registro);

    if (Object.keys(updateData).length === 0) {
      throw new InvalidDomainOperationException(
        'No se proporcionaron campos para actualizar',
      );
    }

    return this.contractRepository.update(id, updateData);
  }

  private extractFields(
    dto: ActualizarContratoMedidorDto,
    current: ContractRow,
  ): Record<string, any> {
    const fields: Record<string, any> = {};
    if (
      dto.estadoServicio !== undefined &&
      dto.estadoServicio !== current.estadoServicio &&
      ([
        'PENDIENTE_INSPECCION',
        'PENDIENTE_PAGO',
        'PENDIENTE_INSTALACION',
        'RECHAZADO',
      ].includes(current.estadoServicio) ||
        [
          'PENDIENTE_INSPECCION',
          'PENDIENTE_PAGO',
          'PENDIENTE_INSTALACION',
          'RECHAZADO',
        ].includes(dto.estadoServicio))
    ) {
      throw new InvalidDomainOperationException(
        'El estado del contrato se actualiza mediante la inspección, el pago y la instalación',
      );
    }
    if (dto.clienteId !== undefined) fields.clienteId = BigInt(dto.clienteId);
    if (dto.estadoServicio !== undefined || dto.estadoCobranza !== undefined) {
      const estadoServicio = dto.estadoServicio ?? current.estadoServicio;
      const estadoCobranza = ContractState.normalizeCollectionStatus(
        dto.estadoCobranza ?? current.estadoCobranza,
        estadoServicio,
      );
      if (estadoServicio !== current.estadoServicio)
        fields.estadoServicio = estadoServicio;
      if (estadoCobranza !== current.estadoCobranza)
        fields.estadoCobranza = estadoCobranza;
    }
    if (dto.direccionSuministro !== undefined)
      fields.direccionSuministro = dto.direccionSuministro;
    if (dto.sectorId !== undefined) fields.sectorId = Number(dto.sectorId);
    if (dto.categoriaTarifaId !== undefined)
      fields.categoriaTarifaId = Number(dto.categoriaTarifaId);
    if (dto.comunidadId !== undefined)
      fields.comunidadId = Number(dto.comunidadId);
    if (dto.latitud !== undefined) fields.latitud = dto.latitud;
    if (dto.longitud !== undefined) fields.longitud = dto.longitud;
    const procedureKeys = [
      'tramitadorEsTitular',
      'tramitadorNombre',
      'tramitadorIdentificacion',
      'relacionTramitador',
      'observacionesTramite',
      'otrasNovedades',
    ] as const;
    if (procedureKeys.some((key) => dto[key] !== undefined)) {
      const changes = Object.fromEntries(
        procedureKeys
          .filter((key) => dto[key] !== undefined)
          .map((key) => [key, dto[key]]),
      );
      const normalized = normalizeContractProcedure({
        ...current,
        tramitadorEsTitular: current.tramitadorEsTitular ?? undefined,
        ...changes,
      });
      Object.assign(fields, normalized);
    }
    return fields;
  }
}
