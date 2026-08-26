import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ActualizarContratoMedidorDto } from '../../interfaces/dto/update-contrato-medidor.dto';
import { ContractEntity } from '../../domain/entities/contract.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<ContractEntity> {
    const registro = await this.contractRepository.findById(id);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', id.toString());
    }

    const updateData = this.extractFields(updateDto);

    if (Object.keys(updateData).length === 0) {
      throw new InvalidDomainOperationException(
        'No se proporcionaron campos para actualizar',
      );
    }

    return this.contractRepository.update(id, updateData);
  }

  private extractFields(
    dto: ActualizarContratoMedidorDto,
  ): Record<string, any> {
    const fields: Record<string, any> = {};
    if (dto.clienteId !== undefined) fields.clienteId = BigInt(dto.clienteId);
    if (dto.estado !== undefined) fields.estado = dto.estado;
    if (dto.direccionSuministro !== undefined)
      fields.direccionSuministro = dto.direccionSuministro;
    if (dto.sectorId !== undefined) fields.sectorId = Number(dto.sectorId);
    if (dto.categoriaTarifaId !== undefined)
      fields.categoriaTarifaId = Number(dto.categoriaTarifaId);
    if (dto.comunidadId !== undefined)
      fields.comunidadId = Number(dto.comunidadId);
    return fields;
  }
}
