import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { MeterRow } from '../../infrastructure/repositories/meter.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(id: bigint): Promise<MeterRow> {
    const medidor = await this.meterRepository.findUnique({
      medidorId: id,
    });
    if (!medidor || medidor.deletedAt) {
      throw new EntityNotFoundException('Medidor', id);
    }
    return medidor;
  }
}
