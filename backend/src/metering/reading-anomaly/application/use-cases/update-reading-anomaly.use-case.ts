import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { UpdateReadingAnomalyDto } from '../../interfaces/dto/update-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

@Injectable()
export class UpdateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    const existing = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.lecturaId)
      dataToUpdate.lecturaId = BigInt(updateDto.lecturaId);

    const anomalia = await this.readingAnomalyRepository.update(
      { anomaliaId: id },
      dataToUpdate,
    );
    return new ReadingAnomalyEntity(anomalia);
  }
}
