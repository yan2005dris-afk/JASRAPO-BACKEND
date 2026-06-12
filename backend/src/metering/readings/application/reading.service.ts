import { Injectable } from '@nestjs/common';
import { CrearLecturaDto } from '../interfaces/dto/create-lectura.dto';
import { ActualizarLecturaDto } from '../interfaces/dto/update-lectura.dto';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { LecturaEntity } from '../domain/entities/lectura.entity';
import { ReadingFilters } from '../domain/repositories/reading.repository';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class ReadingService {
  constructor(
    private readonly createUseCase: CreateReadingUseCase,
    private readonly findAllUseCase: FindAllReadingsUseCase,
    private readonly findOneUseCase: FindOneReadingUseCase,
    private readonly updateUseCase: UpdateReadingUseCase,
    private readonly removeUseCase: RemoveReadingUseCase,
  ) {}

  async create(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: ReadingFilters,
  ): Promise<PaginatedResult<LecturaEntity>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: bigint): Promise<LecturaEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
