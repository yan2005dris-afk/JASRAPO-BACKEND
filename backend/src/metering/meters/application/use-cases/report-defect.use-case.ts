import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/generated/prisma/client';

@Injectable()
export class ReportDefectUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterEntity> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.estado !== EstadoMedidor.INSTALADO) {
      throw new BadRequestException(
        `Solo medidores INSTALADOS pueden reportarse como dañados`,
      );
    }

    return this.meterRepository.update(
      { medidorId },
      {
        estado: EstadoMedidor.DANADO,
      },
    );
  }
}
