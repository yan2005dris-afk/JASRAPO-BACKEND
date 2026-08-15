import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetEligibleReadingsUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    tipoRuta: 'TOMA_LECTURA' | 'RECONEXION';
    comunidadId: number;
    sectorId?: number;
    search?: string;
    pagination: { page?: number; limit?: number };
  }): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const { tipoRuta, comunidadId, sectorId, search, pagination } = params;

    const comunidad = await this.routeRepository.findComunidad(comunidadId);
    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', comunidadId);
    }

    if (sectorId) {
      const sector = await this.routeRepository.findSector(sectorId);
      if (!sector) {
        throw new EntityNotFoundException('Sector', sectorId);
      }
      if (sector.comunidadId !== comunidadId) {
        throw new InvalidDomainOperationException(
          'El sector no pertenece a la comunidad',
        );
      }
    }

    const { skip, take, page } = getPagination(
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );

    return this.routeRepository.paginateLecturas(
      {
        tipoRuta,
        comunidadId,
        sectorId,
        search,
      },
      { skip, take, page },
    );
  }
}
