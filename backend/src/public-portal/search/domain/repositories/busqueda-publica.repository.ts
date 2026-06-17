import type { SearchResultEntity } from '../entities/public-search-result.entity';
import type { ISearchFilters } from '../types/public-search-filters';
import type {
  IContratoConDeudaRaw,
  TipoBusquedaDeuda,
} from '../types/debt-search.types';

export abstract class BusquedaPublicaRepository {
  abstract findManyClientes(
    filters: ISearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]>;

  abstract countClientes(filters: ISearchFilters): Promise<number>;

  abstract findManyContratos(
    filters: ISearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]>;

  abstract countContratos(filters: ISearchFilters): Promise<number>;

  abstract findContratosDeudaBy(
    tipo: TipoBusquedaDeuda,
    valor: string,
    skip: number,
    take: number,
  ): Promise<IContratoConDeudaRaw[]>;

  abstract countContratosDeuda(
    tipo: TipoBusquedaDeuda,
    valor: string,
  ): Promise<number>;
}
