import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ActualizarContratoMedidorDto } from '../../interfaces/dto/update-contrato-medidor.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    const registro = await this.contractRepository.findUnique({
      contratoId: id,
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    if (updateDto.medidorId) {
      const medidorId = BigInt(updateDto.medidorId);
      const lecturaInicial = updateDto.lecturaInicial ?? 0;

      const contractFields: Record<string, any> = {};
      if (updateDto.estado !== undefined)
        contractFields.estado = updateDto.estado;
      if (updateDto.direccionSuministro !== undefined)
        contractFields.direccionSuministro = updateDto.direccionSuministro;
      if (updateDto.sectorId !== undefined)
        contractFields.sectorId = Number(updateDto.sectorId);

      return this.contractRepository.replaceMeterInContract(
        id,
        medidorId,
        lecturaInicial,
        Object.keys(contractFields).length > 0 ? contractFields : undefined,
      );
    }

    // Only update contract fields (no meter replacement)
    const updateData: Record<string, any> = {};
    if (updateDto.estado !== undefined) updateData.estado = updateDto.estado;
    if (updateDto.direccionSuministro !== undefined)
      updateData.direccionSuministro = updateDto.direccionSuministro;
    if (updateDto.sectorId !== undefined)
      updateData.sectorId = Number(updateDto.sectorId);

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron campos para actualizar',
      );
    }

    await this.contractRepository.update({ contratoId: id }, updateData);

    return this.contractRepository.findUnique({ contratoId: id });
  }
}
