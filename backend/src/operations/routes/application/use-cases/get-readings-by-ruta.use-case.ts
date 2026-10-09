import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import type { ReadingForRouteRow } from '../../infrastructure/repositories/route.include';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetReadingsByRutaUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    rutaId: bigint;
    pagination: { page?: number; limit?: number };
  }): Promise<PaginatedResult<ReadingForRouteRow>> {
    const { rutaId, pagination } = params;

    const ruta = await this.routeRepository.findById(rutaId);
    if (!ruta) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const { skip, take } = getPagination(page, limit);

    return this.routeRepository.paginateLecturasByRutaId(rutaId, {
      page,
      limit,
      skip,
      take,
    });
  }
}
