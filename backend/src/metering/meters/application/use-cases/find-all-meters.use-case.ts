import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { FilterMeterDto } from '../../interfaces/dto/filter-meter.dto';
import { PaginatedMeterResponse } from '../../interfaces/types/paginated-meter-response.type';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { buildMeterFilters } from '../mappers/meter-filters.mapper';

@Injectable()
export class FindAllMetersUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(filters?: FilterMeterDto): Promise<PaginatedMeterResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const { skip, take, page: safePage } = getPagination(page, limit);
    const meterFilters = filters ? buildMeterFilters(filters) : undefined;

    const [meters, total, estadoGroups] = await Promise.all([
      this.meterRepository.findMany({ where: meterFilters, skip, take }),
      this.meterRepository.count(meterFilters),
      this.meterRepository.groupByEstado(meterFilters),
    ]);

    const kpiByEstado = new Map<string, number>(
      estadoGroups.map((g) => [g.estado, g._count._all]),
    );

    const totalPages = Math.ceil(total / take);

    return {
      data: meters.map((m) => MeterResponseDto.fromEntity(m)),
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < totalPages ? safePage + 1 : null,
      },
      kpis: {
        enBodega: kpiByEstado.get('BODEGA') ?? 0,
        instalados: kpiByEstado.get('INSTALADO') ?? 0,
        danados: kpiByEstado.get('DANADO') ?? 0,
        total,
      },
    };
  }
}