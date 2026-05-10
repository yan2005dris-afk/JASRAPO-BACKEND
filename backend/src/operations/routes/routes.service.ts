import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterReadingsDto } from './dto/filter-readings.dto';
import { RouteEntity } from './types/route.entity';
import { ReadingForRouteEntity } from './types/reading-for-route.entity';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';

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
  ): Promise<{ data: ReadingForRouteEntity[]; total: number }> {
    return this.getEligibleReadingsUseCase.execute({
      tipoRuta: filterDto.tipoRuta,
      comunidadId: filterDto.comunidadId,
      sectorId: filterDto.sectorId,
      search: filterDto.search,
      skip: filterDto.skip,
      take: filterDto.take,
    });
  }

  async create(createDto: CreateRouteDto): Promise<RouteEntity> {
    return this.createRouteUseCase.execute(createDto);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RutasWhereInput;
  }): Promise<{ data: RouteEntity[]; total: number }> {
    return this.findAllRoutesUseCase.execute(params);
  }

  async findOne(id: bigint): Promise<RouteEntity> {
    return this.findOneRouteUseCase.execute(id);
  }

  async update(id: bigint, updateDto: UpdateRouteDto): Promise<RouteEntity> {
    return this.updateRouteUseCase.execute(id, updateDto);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.deleteRouteUseCase.execute(id);
  }
}
