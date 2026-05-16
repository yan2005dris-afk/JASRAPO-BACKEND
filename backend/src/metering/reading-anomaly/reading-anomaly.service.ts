import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateReadingAnomalyDto } from './dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from './dto/update-reading-anomaly.dto';
import { IResponseReadingAnomaly } from './types/IResponseReadingAnomaly';
import { CreateReadingAnomalyUseCase } from './use-cases/create-reading-anomaly.use-case';
import { FindAllReadingAnomaliesUseCase } from './use-cases/find-all-reading-anomalies.use-case';
import { FindOneReadingAnomalyUseCase } from './use-cases/find-one-reading-anomaly.use-case';
import { UpdateReadingAnomalyUseCase } from './use-cases/update-reading-anomaly.use-case';
import { RemoveReadingAnomalyUseCase } from './use-cases/remove-reading-anomaly.use-case';

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
  ): Promise<IResponseReadingAnomaly> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(
    page = 1,
    limit = 10,
    where?: Prisma.LecturaAnomaliaWhereInput,
  ) {
    return this.findAllUseCase.execute(page, limit, where);
  }

  async findOne(id: bigint): Promise<IResponseReadingAnomaly> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
  ): Promise<IResponseReadingAnomaly> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
