import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

@Injectable()
export class FindOneReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(id: bigint): Promise<ReadingAnomalyEntity> {
    const anomalia = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!anomalia || anomalia.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }
    return new ReadingAnomalyEntity(anomalia);
  }
}
