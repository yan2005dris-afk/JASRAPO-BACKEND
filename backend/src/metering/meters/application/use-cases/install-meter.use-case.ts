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
export class InstallMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<MeterResponseDto> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.estado !== EstadoMedidor.BODEGA) {
      throw new BadRequestException(
        `El medidor no puede ser instalado desde el estado ${medidor.estado}`,
      );
    }

    return await this.meterRepository.executeTransaction(async (tx) => {
      // 1. Update meter status
      const updated = await this.meterRepository.update(
        { medidorId },
        {
          estado: EstadoMedidor.INSTALADO,
        },
        safeMeterSelect,
        tx,
      );

      // 2. Create initial history entry
      await this.meterRepository.createHistory(
        {
          medidor: { connect: { medidorId } },
          contrato: { connect: { contratoId } },
          lecturaInicial: 0, // Default for installation
          motivo: 'INSTALACION INICIAL',
          fechaDesde: new Date(),
        },
        tx,
      );

      return toMeterResponse(updated);
    });
  }
}
