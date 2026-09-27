import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from '../interfaces/dto/create-route.dto';
import { UpdateRouteDto } from '../interfaces/dto/update-route.dto';
import { FilterReadingsDto } from '../interfaces/dto/filter-readings.dto';
import { RouteEntity } from '../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../domain/entities/reading-for-route.entity';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { GetReadingsByRutaUseCase } from './use-cases/get-readings-by-ruta.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { CreateRouteAssignmentsUseCase } from './use-cases/create-route-assignments.use-case';
import { CreateRouteAssignmentsDto } from '../interfaces/dto/create-route-assignments.dto';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';
import { ExportFieldSheetPdfUseCase } from './use-cases/export-field-sheet-pdf.use-case';
import { RouteRepository } from '../domain/repositories/route.repository';
import type { RouteFilters } from '../domain/types/route.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class RoutesService {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly getEligibleReadingsUseCase: GetEligibleReadingsUseCase,
    private readonly getReadingsByRutaUseCase: GetReadingsByRutaUseCase,
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly createRouteAssignmentsUseCase: CreateRouteAssignmentsUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findOneRouteUseCase: FindOneRouteUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
    private readonly exportFieldSheetPdfUseCase: ExportFieldSheetPdfUseCase,
  ) {}

  async exportPdf(rutaId: bigint): Promise<Buffer> {
    return this.exportFieldSheetPdfUseCase.execute(rutaId);
  }

  async getEligibleReadings(
    filterDto: FilterReadingsDto,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    return this.getEligibleReadingsUseCase.execute({
      tipoRuta: filterDto.tipoRuta,
      comunidadId: filterDto.comunidadId,
      sectorId: filterDto.sectorId,
      periodoId: filterDto.periodoId,
      search: filterDto.search,
      pagination: {
        page: filterDto.page,
        limit: filterDto.limit,
      },
    });
  }

  async getReadingsByRuta(
    rutaId: bigint,
    pagination: { page?: number; limit?: number },
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    return this.getReadingsByRutaUseCase.execute({ rutaId, pagination });
  }

  async create(createDto: CreateRouteDto): Promise<RouteEntity> {
    return this.createRouteUseCase.execute(createDto);
  }

  async createAssignments(
    dto: CreateRouteAssignmentsDto,
  ): Promise<RouteEntity[]> {
    return this.createRouteAssignmentsUseCase.execute(dto);
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

  async getPeriodos() {
    return this.routeRepository.findAllPeriodos();
  }

  async getTiposActividad() {
    return this.routeRepository.findAllTiposActividad();
  }
}
