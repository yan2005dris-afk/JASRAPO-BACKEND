import { Injectable } from '@nestjs/common';
import { CreateComunidadDto } from '../../interfaces/dto/create-comunidad.dto';
import { UpdateComunidadDto } from '../../interfaces/dto/update-comunidad.dto';
import { CreateCommunityUseCase } from '../use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from '../use-cases/update-community.use-case';
import { FindAllCommunitiesUseCase } from '../use-cases/find-all-communities.use-case';
import { FindAllCommunitiesWithSectorUseCase } from '../use-cases/find-all-communities-with-sector.use-case';
import { FindOneCommunityUseCase } from '../use-cases/find-one-community.use-case';
import { DeleteCommunityUseCase } from '../use-cases/delete-community.use-case';

@Injectable()
export class ComunidadService {
  constructor(
    private readonly createUseCase: CreateCommunityUseCase,
    private readonly updateUseCase: UpdateCommunityUseCase,
    private readonly findAllUseCase: FindAllCommunitiesUseCase,
    private readonly findAllWithSectorUseCase: FindAllCommunitiesWithSectorUseCase,
    private readonly findOneUseCase: FindOneCommunityUseCase,
    private readonly deleteUseCase: DeleteCommunityUseCase,
  ) {}

  async create(dto: CreateComunidadDto) {
    return this.createUseCase.execute(dto);
  }

  async findAll() {
    return this.findAllUseCase.execute();
  }

  async findAllWithSector(options?: { sectorId?: number }) {
    return this.findAllWithSectorUseCase.execute(options);
  }

  async findOne(id: number) {
    return this.findOneUseCase.execute(id);
  }

  async update(id: number, dto: UpdateComunidadDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async delete(id: number) {
    return this.deleteUseCase.execute(id);
  }
}
