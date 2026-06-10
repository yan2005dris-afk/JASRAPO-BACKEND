import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CrearLecturaDto } from '../interfaces/dto/create-lectura.dto';
import { ActualizarLecturaDto } from '../interfaces/dto/update-lectura.dto';
import { IResponseReading } from '../types/IResponseReading';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';

@Injectable()
export class ReadingService {
  constructor(
    private readonly createUseCase: CreateReadingUseCase,
    private readonly findAllUseCase: FindAllReadingsUseCase,
    private readonly findOneUseCase: FindOneReadingUseCase,
    private readonly updateUseCase: UpdateReadingUseCase,
    private readonly removeUseCase: RemoveReadingUseCase,
  ) {}

  async create(createDto: CrearLecturaDto): Promise<IResponseReading> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(
    page = 1,
    limit = 10,
    where?: Prisma.LecturasWhereInput,
  ) {
    return this.findAllUseCase.execute(page, limit, where);
  }

  async findOne(id: bigint): Promise<IResponseReading> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ): Promise<IResponseReading> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
