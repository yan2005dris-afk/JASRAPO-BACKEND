import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/shared/enums';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterEntity> {
    const medidor = await this.meterRepository.findUnique({
      medidorId,
    });

    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.estado !== EstadoMedidor.PENDIENTE) {
      throw new BadRequestException(
        `El medidor debe estar en estado PENDIENTE para ser instalado, estado actual: ${medidor.estado}`,
      );
    }

    const contrato =
      await this.meterRepository.findActiveContractForMeter(medidorId);

    if (!contrato) {
      throw new BadRequestException(
        'El medidor no tiene un contrato activo vinculado',
      );
    }

    if (contrato.estado !== 'PENDIENTE_INSTALACION') {
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
