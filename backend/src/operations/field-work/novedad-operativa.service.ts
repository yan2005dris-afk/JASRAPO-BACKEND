import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CrearNovedadOperativaDto } from './dto/create-novedad-operativa.dto';
import { ActualizarNovedadOperativaDto } from './dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';
import { CreateFieldWorkUseCase } from './use-cases/create-field-work.use-case';
import { FindAllFieldWorksUseCase } from './use-cases/find-all-field-works.use-case';
import { FindOneFieldWorkUseCase } from './use-cases/find-one-field-work.use-case';
import { UpdateFieldWorkUseCase } from './use-cases/update-field-work.use-case';
import { RemoveFieldWorkUseCase } from './use-cases/remove-field-work.use-case';

@Injectable()
export class NovedadOperativaService {
  constructor(
    private readonly createUseCase: CreateFieldWorkUseCase,
    private readonly findAllUseCase: FindAllFieldWorksUseCase,
    private readonly findOneUseCase: FindOneFieldWorkUseCase,
    private readonly updateUseCase: UpdateFieldWorkUseCase,
    private readonly removeUseCase: RemoveFieldWorkUseCase,
  ) {}

  async crearNovedadOperativa(
    createDto: CrearNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    return this.createUseCase.execute(createDto);
  }

  async buscarNovedades(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NovedadOperativaWhereInput;
  }): Promise<NovedadOperativaEntity[]> {
    return this.findAllUseCase.execute(params);
  }

  async buscarNovedad(id: bigint): Promise<NovedadOperativaEntity> {
    return this.findOneUseCase.execute(id);
  }

  async actualizarNovedad(
    id: bigint,
    updateDto: ActualizarNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async eliminarNovedad(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
