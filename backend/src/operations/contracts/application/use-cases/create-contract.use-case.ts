import { Injectable } from '@nestjs/common';
import { EstadoContrato } from 'src/shared/enums';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { CrearContratoMedidorDto } from '../../interfaces/dto/create-contrato-medidor.dto';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(dto: CrearContratoMedidorDto): Promise<ContractEntity> {
    return this.contractRepository.createContractWithMeterHistory({
      clienteId: BigInt(dto.clienteId),
      categoriaTarifaId: Number(dto.categoriaTarifaId),
      medidorId: BigInt(dto.medidorId),
      comunidadId: Number(dto.comunidadId),
      sectorId: dto.sectorId ? Number(dto.sectorId) : null,
      numeroGuia: dto.numeroGuia,
      direccionSuministro: dto.direccionSuministro,
      estado: (dto.estado || EstadoContrato.PENDIENTE_PAGO) as EstadoContrato,
      creadoPor: dto.creadoPor,
      lecturaInicial: dto.lecturaInicial ?? 0,
    });
  }
}
