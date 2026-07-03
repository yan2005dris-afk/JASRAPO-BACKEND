import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor, EstadoContrato } from 'src/shared/enums';
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

    const contrato =
      await this.meterRepository.findActiveContractForMeter(medidorId);

    if (!contrato) {
      throw new BadRequestException(
        'El medidor no tiene un contrato activo vinculado',
      );
    }

    if (contrato.estado !== EstadoContrato.PENDIENTE_INSTALACION) {
      throw new BadRequestException(
        `El contrato debe estar en estado PENDIENTE_INSTALACION para instalar el medidor, estado actual: ${contrato.estado}`,
      );
    }

    return this.meterRepository.executeTransaction(async (tx) => {
      const updated = await this.meterRepository.update(
        { medidorId },
        {
          estado: EstadoMedidor.INSTALADO,
          fechaInstalacion: new Date(),
        },
        tx,
      );

      return updated;
    });
  }
}
