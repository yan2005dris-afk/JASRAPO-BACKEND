import { Injectable } from '@nestjs/common';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import type { OrdenTrabajoRow } from '../../infrastructure/repositories/route.include';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type { OrdenTrabajoFilters } from '../../domain/types/orden-trabajo.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';

export interface FindOrdenesByRutaParams {
  rutaId: bigint;
  filters?: Partial<OrdenTrabajoFilters>;
  pagination: PaginateOptions;
}

@Injectable()
export class FindOrdenesByRutaUseCase {
  constructor(
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(
    params: FindOrdenesByRutaParams,
  ): Promise<PaginatedResult<OrdenTrabajoRow>> {
    // Validate route exists
    const route = await this.routeRepository.findById(params.rutaId);
    if (!route) {
      throw new EntityNotFoundException('Ruta', params.rutaId.toString());
    }

    const filters: OrdenTrabajoFilters = {
      rutaId: params.rutaId,
      estado: params.filters?.estado,
    };

    return this.ordenTrabajoRepository.findByRutaId(
      params.rutaId,
      filters,
      params.pagination,
    );
  }
}
