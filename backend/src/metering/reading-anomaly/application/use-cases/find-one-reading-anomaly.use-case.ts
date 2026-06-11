import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { safeReadingAnomaliesSelect } from '../../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../../types/readingAnomalyMapper';

@Injectable()
export class FindOneReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(id: bigint) {
    const anomalia = await this.readingAnomalyRepository.findUnique(
      { anomaliaId: id },
      safeReadingAnomaliesSelect,
    );
    if (!anomalia || anomalia.deletedAt !== null) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }
    return toReadingAnomalyResponse(anomalia);
  }
}
