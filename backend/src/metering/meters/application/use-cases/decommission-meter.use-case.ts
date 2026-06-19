import { Injectable, BadRequestException } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/shared/enums';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint, motivo: string): Promise<MeterEntity> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt) {
      throw new BadRequestException('Medidor no encontrado');
    }

    if (medidor.estado !== EstadoMedidor.DANADO) {
      throw new BadRequestException(
        `Un medidor debe estar DANADO antes de darse de baja`,
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
