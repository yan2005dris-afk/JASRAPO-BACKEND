import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';
import type { MeterEntity } from '../../../meters/domain/entities/meter.entity';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterEntity> {
    const meter = await this.meterRepository.findUnique({ medidorId });

    if (!meter || meter.deletedAt) {
      throw new NotFoundException('Meter not found');
    }

    if (meter.estado !== EstadoMedidor.PENDIENTE) {
      throw new BadRequestException(
        `Meter must be in PENDIENTE state to be installed, current state: ${meter.estado}`,
      );
    }

    return this.meterRepository.update(
      { medidorId },
      {
        estado: EstadoMedidor.INSTALADO,
        fechaInstalacion: new Date(),
      },
    );
  }
}
