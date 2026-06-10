import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';

@Injectable()
export class RemoveReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }

    await this.readingAnomalyRepository.update(
      { anomaliaId: id },
      { deletedAt: new Date() },
    );
    return { message: 'Anomalía eliminada correctamente' };
  }
}
