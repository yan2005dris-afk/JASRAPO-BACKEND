import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { ClientEntity } from '../entities/client.entity';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  IdentificationTypeRef,
  ConsumidorFinalData,
} from '../types/client.types';

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
  ): Promise<IdentificationTypeRef | null>;

  abstract findActiveTipoIdentificaciones(): Promise<IdentificationTypeRef[]>;

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
