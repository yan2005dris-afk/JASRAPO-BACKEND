import { Injectable } from '@nestjs/common';
import { CreateReadingAnomalyDto } from '../interfaces/dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from '../interfaces/dto/update-reading-anomaly.dto';
import { CreateReadingAnomalyUseCase } from './use-cases/create-reading-anomaly.use-case';
import { FindAllReadingAnomaliesUseCase } from './use-cases/find-all-reading-anomalies.use-case';
import { FindOneReadingAnomalyUseCase } from './use-cases/find-one-reading-anomaly.use-case';
import { UpdateReadingAnomalyUseCase } from './use-cases/update-reading-anomaly.use-case';
import { RemoveReadingAnomalyUseCase } from './use-cases/remove-reading-anomaly.use-case';
import { ReadingAnomalyEntity } from '../domain/entities/reading-anomaly.entity';
import { ReadingAnomalyFilters } from '../domain/repositories/reading-anomaly.repository';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class ReadingAnomalyService {
  constructor(
    private readonly createUseCase: CreateReadingAnomalyUseCase,
    private readonly findAllUseCase: FindAllReadingAnomaliesUseCase,
    private readonly findOneUseCase: FindOneReadingAnomalyUseCase,
    private readonly updateUseCase: UpdateReadingAnomalyUseCase,
    private readonly removeUseCase: RemoveReadingAnomalyUseCase,
  ) {}

  async create(
    createDto: CreateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: ReadingAnomalyFilters,
  ): Promise<PaginatedResult<ReadingAnomalyEntity>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: bigint): Promise<ReadingAnomalyEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
