import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { RubroFilters } from '../../domain/types/rubro.types';
import type { RubroEntity } from '../../domain/entities/rubro.entity';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export interface FindAllRubrosParams {
  page?: number;
  limit?: number;
  nombre?: string;
  tipoRubro?: string;
  tarifaImpuestoId?: number;
  activo?: boolean;
}

@Injectable()
export class FindAllRubrosUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(params: FindAllRubrosParams): Promise<PaginatedResult<RubroEntity>> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: RubroFilters = {};
    if (params.nombre?.trim()) {
      where.nombre = params.nombre.trim();
    }
    if (params.tipoRubro) {
      where.tipoRubro = params.tipoRubro as any;
    }
    if (params.tarifaImpuestoId !== undefined) {
      where.tarifaImpuestoId = Number(params.tarifaImpuestoId);
    }
    if (params.activo !== undefined) {
      where.activo = params.activo;
    }

    const [items, total] = await Promise.all([
      this.rubroRepository.findAll({
        where,
        skip,
        take: limit,
        orderBy: { rubroId: 'desc' },
      }),
      this.rubroRepository.count({ where }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / limit));

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        ultimaPagina: lastPage,
        paginaActual: page,
        porPagina: limit,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < lastPage ? page + 1 : null,
      },
    };
  }
}
