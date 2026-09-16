import { Injectable } from '@nestjs/common';
import { EstadoLectura } from 'src/shared/enums';
import { ActualizarLecturaDto } from '../interfaces/dto/update-lectura.dto';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { LecturaEntity } from '../domain/entities/lectura.entity';
import { ReadingFilters } from '../domain/repositories/reading.repository';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class ReadingService {
  constructor(
    private readonly findAllUseCase: FindAllReadingsUseCase,
    private readonly findOneUseCase: FindOneReadingUseCase,
    private readonly updateUseCase: UpdateReadingUseCase,
    private readonly removeUseCase: RemoveReadingUseCase,
  ) {}

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
    targetEstado?: EstadoLectura,
  ): Promise<LecturaEntity> {
    return this.updateUseCase.execute(id, updateDto, targetEstado);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
