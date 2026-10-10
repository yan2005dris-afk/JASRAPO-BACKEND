import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type { ClientRow } from '../../infrastructure/repositories/client.include';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  IdentificationTypeRef,
  ConsumidorFinalData,
} from '../types/client.types';

export abstract class ClientRepository {
  abstract findById(id: bigint): Promise<ClientRow | null>;

  abstract findByIdentificacion(
    identificacion: string,
  ): Promise<ClientRow | null>;

  abstract create(data: CreateClientData): Promise<ClientRow>;

  abstract updateClient(id: bigint, data: UpdateClientData): Promise<ClientRow>;

  abstract softDelete(id: bigint): Promise<ClientRow>;

  abstract findTipoIdentificacionById(
    id: number,
  ): Promise<IdentificationTypeRef | null>;

  abstract findActiveTipoIdentificaciones(): Promise<IdentificationTypeRef[]>;

  /**
   * Enforce the single-active CONSUMIDOR_FINAL invariant atomically: create the
   * singleton when none exists, reactivate a soft-deleted principal, and
   * soft-delete any extra records.
   */
  abstract reactivateOrCreateConsumidorFinal(
    data: ConsumidorFinalData,
  ): Promise<ClientRow>;

  abstract paginateClientes(
    args: {
      filters?: ClientFilters;
      orderBy?: Record<string, any>;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ClientRow>>;
}
