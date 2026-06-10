import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { safeMeterSelect } from '../../domain/types/IResponseMeters';
import { toMeterResponse } from '../../domain/types/metersMapper';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class ReportDefectUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterResponseDto> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt)
      throw new NotFoundException('Medidor no encontrado');

    if (medidor.estado !== EstadoMedidor.INSTALADO) {
      throw new BadRequestException(
        `Solo medidores INSTALADOS pueden reportarse como dañados`,
      );
    }

    const updated = await this.meterRepository.update(
      { medidorId },
      {
        estado: EstadoMedidor.DANADO,
      },
      safeMeterSelect,
    );
    return toMeterResponse(updated);
  }
}
