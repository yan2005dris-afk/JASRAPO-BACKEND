import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from '../interfaces/dto/create-route.dto';
import { UpdateRouteDto } from '../interfaces/dto/update-route.dto';
import { FilterReadingsDto } from '../interfaces/dto/filter-readings.dto';
import { RouteEntity } from '../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../domain/entities/reading-for-route.entity';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';
import type { RouteFilters } from '../domain/types/route-filters';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class RoutesService {
  constructor(
    private readonly getEligibleReadingsUseCase: GetEligibleReadingsUseCase,
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findOneRouteUseCase: FindOneRouteUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
  ) {}

  async getEligibleReadings(
    filterDto: FilterReadingsDto,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    return this.getEligibleReadingsUseCase.execute({
      tipoRuta: filterDto.tipoRuta,
      comunidadId: filterDto.comunidadId,
      sectorId: filterDto.sectorId,
      search: filterDto.search,
      pagination: {
        page: filterDto.page,
        limit: filterDto.limit,
      },
    });
  }

  async create(createDto: CreateRouteDto): Promise<RouteEntity> {
    return this.createRouteUseCase.execute(createDto);
  }

  async findAll(params: {
    pagination: { page?: number; limit?: number };
    where?: RouteFilters;
  }): Promise<PaginatedResult<RouteEntity>> {
    return this.findAllRoutesUseCase.execute(params);
  }

  async findOne(id: bigint): Promise<RouteEntity> {
    return this.findOneRouteUseCase.execute(id);
  }

  async update(id: bigint, updateDto: UpdateRouteDto): Promise<RouteEntity> {
    return this.updateRouteUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<RouteEntity> {
    return this.deleteRouteUseCase.execute(id);
  }
}
