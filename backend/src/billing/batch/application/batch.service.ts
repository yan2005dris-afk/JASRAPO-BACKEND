import { Injectable } from '@nestjs/common';
import { GenerateBatchDto } from '../interfaces/dto/generate-batch.dto';
import { BATCH_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { GenerateBatchUseCase } from './use-cases/generate-batch.use-case';
import { FindAllBatchesUseCase } from './use-cases/find-all-batches.use-case';
import { FindOneBatchUseCase } from './use-cases/find-one-batch.use-case';
import type { BatchRow } from '../domain/types/batch.types';
import type {
  BatchFilters,
  GenerateBatchResult,
} from '../domain/types/batch.types';

@Injectable()
export class BatchService {
  constructor(
    private readonly generateUseCase: GenerateBatchUseCase,
    private readonly findAllUseCase: FindAllBatchesUseCase,
    private readonly findOneUseCase: FindOneBatchUseCase,
  ) {}

  async generate(dto: GenerateBatchDto): Promise<GenerateBatchResult> {
    return this.generateUseCase.execute({
      periodoId: dto.periodoId,
      rutaId: dto.rutaId,
      mes: dto.mes,
      comunidadId: dto.comunidadId ?? null,
      creadoPor: dto.creadoPor ?? 'SYSTEM',
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchRow>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: number): Promise<BatchRow> {
    return this.findOneUseCase.execute(id);
  }

  /**
   * Batch status catalog
   */
  async findAllStates(): Promise<EnumStateDto[]> {
    return BATCH_STATUS_LIST;
  }
}
