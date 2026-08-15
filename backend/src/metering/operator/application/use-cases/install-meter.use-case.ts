import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor, EstadoContrato } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import type { MeterEntity } from '../../../meters/domain/entities/meter.entity';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterEntity> {
    const meter = await this.meterRepository.findUnique({ medidorId });

    if (!meter || meter.deletedAt) {
      throw new EntityNotFoundException('Medidor', medidorId.toString());
    }

    if (meter.estado !== EstadoMedidor.PENDIENTE) {
      throw new InvalidDomainOperationException(
        `Meter must be in PENDIENTE state to be installed, current state: ${meter.estado}`,
      );
    }

    const contrato =
      await this.meterRepository.findActiveContractForMeter(medidorId);

    if (!contrato) {
      throw new InvalidDomainOperationException(
        'El medidor no tiene un contrato activo vinculado',
      );
    }

    if (contrato.estado !== EstadoContrato.PENDIENTE_INSTALACION) {
      throw new InvalidDomainOperationException(
        `El contrato debe estar en estado PENDIENTE_INSTALACION para instalar el medidor, estado actual: ${contrato.estado}`,
      );
    }

    return this.meterRepository.installMeter({
      medidorId,
      contratoId: contrato.contratoId,
      estado: EstadoMedidor.INSTALADO,
      estadoContrato: EstadoContrato.ACTIVO,
      fechaInstalacion: new Date(),
    });
  }
}