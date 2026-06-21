import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';
import type { MeterEntity } from '../../../meters/domain/entities/meter.entity';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint, motivo: string): Promise<MeterEntity> {
    const meter = await this.meterRepository.findUnique({ medidorId });

    if (!meter || meter.deletedAt) {
      throw new NotFoundException('Meter not found');
    }

    if (meter.estado !== EstadoMedidor.DANADO) {
      throw new BadRequestException(
        `Meter must be in DANADO state to be decommissioned, current state: ${meter.estado}`,
      );
    }

    return this.meterRepository.update(
      { medidorId },
      {
        estado: EstadoMedidor.BAJA,
        fechaBaja: new Date(),
        motivo,
      },
    );
  }
}
