import type { SearchResultEntity } from '../entities/public-search-result.entity';
import type { SearchFilters } from '../types/public-search-filters';

export abstract class BusquedaPublicaRepository {
  abstract findManyClientes(
    filters: SearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]>;

  abstract countClientes(filters: SearchFilters): Promise<number>;

  abstract findManyContratos(
    filters: SearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]>;

  abstract countContratos(filters: SearchFilters): Promise<number>;
}
