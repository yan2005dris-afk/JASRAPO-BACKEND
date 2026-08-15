import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { FindOneMeterUseCase } from './find-one-meter.use-case';

@Injectable()
export class RemoveMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly findOneUseCase: FindOneMeterUseCase,
  ) {}

  async execute(id: bigint): Promise<{ message: string }> {
    await this.findOneUseCase.execute(id);
    await this.meterRepository.update(
      { medidorId: id },
      { deletedAt: new Date() },
    );
    return { message: `Medidor con ID ${id} eliminado` };
  }
}
