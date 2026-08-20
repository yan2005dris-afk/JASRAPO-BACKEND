import type { OrdenTrabajoEntity } from '../entities/orden-trabajo.entity';
import type {
  OrdenTrabajoFilters,
  UpdateOrdenEstadoData,
  LinkLecturaData,
} from '../types/orden-trabajo.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

export abstract class OrdenTrabajoRepository {
  abstract findById(
    ordenTrabajoId: bigint,
    includeDeleted?: boolean,
  ): Promise<OrdenTrabajoEntity | null>;

  abstract findByRutaId(
    rutaId: bigint,
    filters: OrdenTrabajoFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<OrdenTrabajoEntity>>;

  abstract updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoEntity>;

  abstract linkLectura(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
  ): Promise<OrdenTrabajoEntity>;

  abstract findLecturaById(lecturaId: bigint): Promise<any>;
}
