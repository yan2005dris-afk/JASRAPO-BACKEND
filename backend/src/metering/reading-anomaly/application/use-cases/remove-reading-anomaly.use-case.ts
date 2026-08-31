import { Injectable } from '@nestjs/common';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

@Injectable()
export class RemoveReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new EntityNotFoundException('Anomalia de lectura', id);
    }

    await this.readingAnomalyRepository.update(
      { anomaliaId: id },
      { deletedAt: new Date() },
    );

    if (existing.fotoUrl) {
      try {
        await this.storageService.delete(
          SRI_STORAGE_TYPES.READING_NEWS,
          existing.fotoUrl,
        );
      } catch (error) {
        this.logger.error(
          `[READING-ANOMALY] evidence_cleanup outcome=failed key=${existing.fotoUrl} error=${(error as Error).message}`,
        );
      }
    }
    return { message: 'Anomalía eliminada correctamente' };
  }
}
