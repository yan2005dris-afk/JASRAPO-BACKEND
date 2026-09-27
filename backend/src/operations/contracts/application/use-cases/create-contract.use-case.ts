import { Injectable } from '@nestjs/common';
import { ContractState } from '../../domain/contract-state';
import { EstadoServicioContrato } from 'src/shared/enums';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { CrearContratoMedidorDto } from '../../interfaces/dto/create-contrato-medidor.dto';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(dto: CrearContratoMedidorDto): Promise<ContractEntity> {
    const estadoServicio = EstadoServicioContrato.PENDIENTE_INSPECCION;
    const estadoCobranza = ContractState.normalizeCollectionStatus(
      dto.estadoCobranza,
      estadoServicio,
    );

    return this.contractRepository.createContractWithMeterHistory({
      clienteId: BigInt(dto.clienteId),
      categoriaTarifaId: Number(dto.categoriaTarifaId),
      medidorId: BigInt(dto.medidorId),
      comunidadId: Number(dto.comunidadId),
      sectorId: dto.sectorId ? Number(dto.sectorId) : null,
      numeroGuia: dto.numeroGuia,
      direccionSuministro: dto.direccionSuministro,
      estadoServicio,
      estadoCobranza,
      creadoPor: dto.creadoPor,
      lecturaInicial: dto.lecturaInicial ?? 0,
      latitud: dto.latitud,
      longitud: dto.longitud,
    });
  }
}
