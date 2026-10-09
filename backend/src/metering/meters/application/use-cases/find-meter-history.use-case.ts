import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { MeterHistoryRow } from '../../infrastructure/repositories/meter.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindMeterHistoryUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(medidorId: bigint): Promise<MeterHistoryRow[]> {
    const medidor = await this.meterRepository.findUnique({ medidorId });
    if (!medidor || medidor.deletedAt) {
      throw new EntityNotFoundException('Medidor', medidorId);
    }
    return this.meterRepository.findHistoryByMeter(medidorId);
  }
}
