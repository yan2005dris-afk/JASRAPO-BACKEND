import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CrearLecturaDto } from './dto/create-lectura.dto';
import { ActualizarLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';

@Injectable()
export class LecturaService {
  constructor(
    private readonly createUseCase: CreateReadingUseCase,
    private readonly findAllUseCase: FindAllReadingsUseCase,
    private readonly findOneUseCase: FindOneReadingUseCase,
    private readonly updateUseCase: UpdateReadingUseCase,
    private readonly removeUseCase: RemoveReadingUseCase,
  ) {}

  async crearLectura(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    return this.createUseCase.execute(createDto);
  }

  async buscarLecturas(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
  }): Promise<LecturaEntity[]> {
    return this.findAllUseCase.execute(params);
  }

  async buscarLectura(id: bigint): Promise<LecturaEntity> {
    return this.findOneUseCase.execute(id);
  }

  async actualizarLectura(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async eliminarLectura(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
