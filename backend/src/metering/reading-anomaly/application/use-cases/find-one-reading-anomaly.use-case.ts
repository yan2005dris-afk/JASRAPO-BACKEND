import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(id: bigint): Promise<ReadingAnomalyEntity> {
    const anomalia = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!anomalia || anomalia.deletedAt !== null) {
      throw new EntityNotFoundException('Anomalia de lectura', id);
    }
    return anomalia;
  }
}
