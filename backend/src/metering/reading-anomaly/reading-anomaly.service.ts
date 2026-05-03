import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateReadingAnomalyDto } from './dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from './dto/update-reading-anomaly.dto';
import { ReadingAnomalyEntity } from './entities/reading-anomaly.entity';
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
  ): Promise<ReadingAnomalyEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
  }): Promise<ReadingAnomalyEntity[]> {
    return this.findAllUseCase.execute(params);
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
