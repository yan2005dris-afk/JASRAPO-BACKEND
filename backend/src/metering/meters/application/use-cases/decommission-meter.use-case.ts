import { Injectable, BadRequestException } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { safeMeterSelect } from '../../domain/types/IResponseMeters';
import { toMeterResponse } from '../../domain/types/metersMapper';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint, motivo: string): Promise<MeterResponseDto> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt)
      throw new BadRequestException('Medidor no encontrado');

    if (medidor.estado !== EstadoMedidor.DANADO) {
      throw new BadRequestException(
        `Un medidor debe estar DANADO antes de darse de baja`,
      );
    }

    const updated = await this.meterRepository.update(
      { medidorId },
      {
        estado: EstadoMedidor.BAJA,
        fechaBaja: new Date(),
        motivo,
      },
      safeMeterSelect,
    );
    return toMeterResponse(updated);
  }
}
