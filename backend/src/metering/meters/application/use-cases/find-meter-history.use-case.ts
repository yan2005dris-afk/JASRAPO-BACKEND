import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterHistoryEntity } from '../../domain/entities/meter-history.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindMeterHistoryUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterHistoryEntity[]> {
    const medidor = await this.meterRepository.findUnique({ medidorId });
    if (!medidor || medidor.deletedAt) {
      throw new EntityNotFoundException('Medidor', medidorId);
    }
    return this.meterRepository.findHistoryByMeter(medidorId);
  }
}
