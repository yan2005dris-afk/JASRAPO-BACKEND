import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type { BatchEntity } from '../../domain/entities/batch.entity';

@Injectable()
export class FindOneBatchUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(id: number): Promise<BatchEntity> {
    const batch = await this.batchRepository.findById(id);

    if (!batch) {
      throw new EntityNotFoundException('Lote', id);
    }

    return batch;
  }
}
