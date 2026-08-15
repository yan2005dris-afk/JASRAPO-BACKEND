import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(id: bigint): Promise<MeterEntity> {
    const medidor = await this.meterRepository.findUnique({
      medidorId: id,
    });
    if (!medidor || medidor.deletedAt) {
      throw new EntityNotFoundException('Medidor', id);
    }
    return medidor;
  }
}
