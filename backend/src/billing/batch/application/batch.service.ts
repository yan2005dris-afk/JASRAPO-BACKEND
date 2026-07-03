import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../domain/repositories/batch.repository';
import { GenerateBatchDto } from '../interfaces/dto/generate-batch.dto';
import { BATCH_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { GenerateBatchUseCase } from './use-cases/generate-batch.use-case';
import { FindAllBatchesUseCase } from './use-cases/find-all-batches.use-case';
import { FindOneBatchUseCase } from './use-cases/find-one-batch.use-case';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly generateUseCase: GenerateBatchUseCase,
    private readonly findAllUseCase: FindAllBatchesUseCase,
    private readonly findOneUseCase: FindOneBatchUseCase,
  ) {}

  async generate(dto: GenerateBatchDto) {
    return this.generateUseCase.execute(dto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    return this.findAllUseCase.execute(page, limit);
  }

  async findOne(id: number) {
    return this.findOneUseCase.execute(id);
  }

  /**
   * Batch status catalog
   */
  async findAllStates(): Promise<EnumStateDto[]> {
    return BATCH_STATUS_LIST;
  }
}
