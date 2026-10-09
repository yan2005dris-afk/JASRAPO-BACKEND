import { Injectable } from '@nestjs/common';
import { FindOrdenesByRutaUseCase } from './use-cases/find-ordenes-by-ruta.use-case';
import { UpdateOrdenEstadoUseCase } from './use-cases/update-orden-estado.use-case';
import { LinkLecturaUseCase } from './use-cases/link-lectura.use-case';
import { OrdenTrabajoRepository } from '../domain/repositories/orden-trabajo.repository';
import type { OrdenTrabajoRow } from '../infrastructure/repositories/route.include';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type {
  OrdenTrabajoFilters,
  UpdateOrdenEstadoData,
  LinkLecturaData,
} from '../domain/types/orden-trabajo.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly findOrdenesByRutaUseCase: FindOrdenesByRutaUseCase,
    private readonly updateOrdenEstadoUseCase: UpdateOrdenEstadoUseCase,
    private readonly linkLecturaUseCase: LinkLecturaUseCase,
  ) {}

  async findByRuta(params: {
    rutaId: bigint;
    filters?: Partial<OrdenTrabajoFilters>;
    pagination: PaginateOptions;
  }): Promise<PaginatedResult<OrdenTrabajoRow>> {
    return this.findOrdenesByRutaUseCase.execute(params);
  }

  async updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
    operarioId: number,
  ): Promise<OrdenTrabajoRow> {
    return this.updateOrdenEstadoUseCase.execute(
      ordenTrabajoId,
      data,
      operarioId,
    );
  }

  async linkLectura(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
    operarioId: number,
  ): Promise<OrdenTrabajoRow> {
    return this.linkLecturaUseCase.execute(ordenTrabajoId, data, operarioId);
  }
}
