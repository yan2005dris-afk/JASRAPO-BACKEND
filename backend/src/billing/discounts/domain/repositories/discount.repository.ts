import type { DiscountEntity } from '../entities/discount.entity';

export interface DiscountWhereUniqueInput {
  id: number;
}

export interface DiscountWhereInput {
  activo?: boolean;
  tipoDescuento?: string;
  aplicaAutomatico?: boolean;
}

export interface DiscountOrderByInput {
  id?: 'asc' | 'desc';
}

export interface DiscountFindManyParams {
  where?: DiscountWhereInput;
  orderBy?: DiscountOrderByInput;
  skip?: number;
  take?: number;
}

export interface DiscountCreateInput {
  nombre: string;
  descripcion?: string | null;
  tipoDescuento: string;
  valor: number;
  esPorcentaje: boolean;
  rubroId?: number | null;
  aplicaAutomatico?: boolean;
}

export interface DiscountUpdateInput {
  nombre?: string;
  descripcion?: string | null;
  tipoDescuento?: string;
  valor?: number;
  esPorcentaje?: boolean;
  rubroId?: number | null;
  aplicaAutomatico?: boolean;
  activo?: boolean;
}

export type TransactionContext = any;

export abstract class DiscountRepository {
  abstract createCatalogo(data: DiscountCreateInput): Promise<DiscountEntity>;

  abstract findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountEntity[]>;

  abstract countCatalogo(params: {
    where?: DiscountWhereInput;
  }): Promise<number>;

  abstract findUniqueCatalogo(
    where: DiscountWhereUniqueInput,
  ): Promise<DiscountEntity | null>;

  abstract updateCatalogo(
    where: DiscountWhereUniqueInput,
    data: DiscountUpdateInput,
  ): Promise<DiscountEntity>;

  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
