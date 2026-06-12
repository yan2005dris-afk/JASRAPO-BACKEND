import { Injectable, NotFoundException } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(id: bigint): Promise<MeterEntity> {
    const medidor = await this.meterRepository.findUnique({
      medidorId: id,
    });
    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    }
    return medidor;
  }
}
