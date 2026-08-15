import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { ClientEntity } from '../entities/client.entity';
import type { CreateClientData } from '../types/create-client-data';
import type { UpdateClientData } from '../types/update-client-data';
import type { ClientFilters } from '../types/client-filters';
import type { IResponseIdentificacion } from '../types/IResponseIdentificacion';
import type { ConsumidorFinalData } from '../types/consumidor-final-data';

/**
 * NOTE (residual): `PaginateOptions`/`PaginatedResult` come from
 * `src/infrastructure/common/...`, making the domain depend on infrastructure.
 * This is a cross-cutting issue shared with other modules; moving those types
 * to the shared domain is out of scope for this refactor and kept as-is.
 */
export abstract class ClientRepository {
  abstract findById(id: bigint): Promise<ClientEntity | null>;

  abstract findByIdentificacion(
    identificacion: string,
  ): Promise<ClientEntity | null>;

  abstract create(data: CreateClientData): Promise<ClientEntity>;

  abstract updateClient(
    id: bigint,
    data: UpdateClientData,
  ): Promise<ClientEntity>;

  abstract softDelete(id: bigint): Promise<ClientEntity>;

  abstract findTipoIdentificacionById(
    id: number,
  ): Promise<IResponseIdentificacion | null>;

  abstract findActiveTipoIdentificaciones(): Promise<IResponseIdentificacion[]>;

  /**
   * Enforce the single-active CONSUMIDOR_FINAL invariant atomically: create the
   * singleton when none exists, reactivate a soft-deleted principal, and
   * soft-delete any extra records.
   */
  abstract reactivateOrCreateConsumidorFinal(
    data: ConsumidorFinalData,
  ): Promise<ClientEntity>;

  abstract paginateClientes(
    args: {
      filters?: ClientFilters;
      orderBy?: Record<string, any>;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ClientEntity>>;
}
