import type { TariffCategoryEntity } from '../entities/tariff-category.entity';
import type {
  CreateTariffCategoryData,
  UpdateTariffCategoryData,
  TariffCategoryFilters,
} from '../types/tariff.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

export abstract class TariffRepository {
  abstract findById(
    id: number,
    includeDeleted?: boolean,
  ): Promise<TariffCategoryEntity | null>;

  abstract findActiveByNombre(
    nombre: string,
  ): Promise<TariffCategoryEntity | null>;

  abstract paginate(
    filters: TariffCategoryFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<TariffCategoryEntity>>;

  abstract create(
    data: CreateTariffCategoryData,
  ): Promise<TariffCategoryEntity>;

  abstract createNewVersion(
    currentId: number,
    data: UpdateTariffCategoryData,
  ): Promise<TariffCategoryEntity>;

  abstract softDelete(id: number): Promise<TariffCategoryEntity>;
}
