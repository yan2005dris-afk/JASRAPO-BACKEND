import { Injectable } from '@nestjs/common';
import { CreateComunidadDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { GetAllCommunitiesUseCase } from './use-cases/get-all-communities.use-case';
import { GetCommunityUseCase } from './use-cases/get-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';

@Injectable()
export class ComunidadService {
  constructor(
    private readonly createUseCase: CreateCommunityUseCase,
    private readonly updateUseCase: UpdateCommunityUseCase,
    private readonly getAllUseCase: GetAllCommunitiesUseCase,
    private readonly getOneUseCase: GetCommunityUseCase,
    private readonly deleteUseCase: DeleteCommunityUseCase,
  ) {}

  async crearComunidad(dto: CreateComunidadDto) {
    return this.createUseCase.execute(dto);
  }

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async findOne(id: number) {
    return this.getOneUseCase.execute(id);
  }

  async actualizarComunidad(id: number, dto: UpdateComunidadDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async eliminarActualizar(id: number) {
    return this.deleteUseCase.execute(id);
  }
}
