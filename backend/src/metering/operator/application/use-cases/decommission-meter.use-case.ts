import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { EstadoMedidor } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import type { MeterEntity } from '../../../meters/domain/entities/meter.entity';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly operatorRepository: OperatorRepository,
  ) {}

  async execute(
    medidorId: bigint,
    motivo: string,
    operarioId = 0,
  ): Promise<MeterEntity> {
    const meter = await this.meterRepository.findUnique({ medidorId });

    if (!meter || meter.deletedAt) {
      throw new EntityNotFoundException('Medidor', medidorId.toString());
    }

    if (meter.estado !== EstadoMedidor.DANADO) {
      throw new InvalidDomainOperationException(
        `Meter must be in DANADO state to be decommissioned, current state: ${meter.estado}`,
      );
    }

    await this.operatorRepository.verifyMeterOwnership(operarioId, medidorId);

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
