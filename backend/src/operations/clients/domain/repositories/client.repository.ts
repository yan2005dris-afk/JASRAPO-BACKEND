import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ClientEntity } from '../entities/client.entity';
import type { CreateClientData } from '../types/create-client-data';
import type { ClientFilters } from '../types/client-filters';

export abstract class ClientRepository {
  abstract findFirst(where: Record<string, any>): Promise<ClientEntity | null>;

  abstract findUnique(where: Record<string, any>): Promise<any>;

  abstract findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ClientEntity[]>;

  abstract create(data: CreateClientData): Promise<ClientEntity>;

  abstract update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any>;

  abstract updateMany(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any>;

  abstract findCatalogoTipoIdentificacion(where: {
    id: number;
  }): Promise<{
    id: number;
    codigo: string;
    descripcion: string;
    activo: boolean;
  } | null>;

  abstract findManyCatalogoTipoIdentificacion(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<any[]>;

  abstract paginateClientes(
    args: {
      filters?: ClientFilters;
      orderBy?: Record<string, any>;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ClientEntity>>;
}
