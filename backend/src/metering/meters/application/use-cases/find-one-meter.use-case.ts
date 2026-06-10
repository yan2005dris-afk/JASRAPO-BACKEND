import { Injectable, NotFoundException } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { safeMeterSelectWithDelete } from '../../domain/types/IResponseMeters';
import { toMeterResponse } from '../../domain/types/metersMapper';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(id: bigint): Promise<MeterResponseDto> {
    const medidor = await this.meterRepository.findUnique(
      {
        medidorId: id,
      },
      safeMeterSelectWithDelete,
    );
    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    }
    return toMeterResponse(medidor);
  }
}
