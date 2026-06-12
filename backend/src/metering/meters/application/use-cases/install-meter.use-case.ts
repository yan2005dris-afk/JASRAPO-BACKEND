import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/generated/prisma/client';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<MeterEntity> {
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

    return this.meterRepository.executeTransaction(async (tx) => {
      // 1. Update meter status
      const updated = await this.meterRepository.update(
        { medidorId },
        {
          estado: EstadoMedidor.INSTALADO,
        },
        tx,
      );

      // 2. Create initial history entry
      await this.meterRepository.createHistory(
        {
          medidorId,
          contratoId,
          lecturaInicial: 0,
          motivo: 'INSTALACION INICIAL',
          fechaDesde: new Date(),
        },
        tx,
      );

      return updated;
    });
  }
}
