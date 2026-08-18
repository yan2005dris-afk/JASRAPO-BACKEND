import type { DiscountEntity } from '../entities/discount.entity';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
  DiscountFindManyParams,
} from '../types/discount.types';

export abstract class DiscountRepository {
  abstract createCatalogo(data: CreateDiscountData): Promise<DiscountEntity>;

  abstract findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountEntity[]>;

  abstract countCatalogo(params: { where?: DiscountFilters }): Promise<number>;

  abstract findUniqueCatalogo(id: number): Promise<DiscountEntity | null>;

  abstract updateCatalogo(
    id: number,
    data: UpdateDiscountData,
  ): Promise<DiscountEntity>;

  abstract findRubros(): Promise<
    Array<{
      rubroId: number;
      nombre: string;
      tipoRubro: string;
      precioUnitario: any;
    }>
  >;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
