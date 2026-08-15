export interface DiscountFilters {
  activo?: boolean;
  tipoDescuento?: string;
  aplicaAutomatico?: boolean;
}

export interface DiscountOrderBy {
  id?: 'asc' | 'desc';
}

export interface DiscountFindManyParams {
  where?: DiscountFilters;
  orderBy?: DiscountOrderBy;
  skip?: number;
  take?: number;
}

export interface CreateDiscountData {
  nombre: string;
  descripcion?: string | null;
  tipoDescuento: string;
  valor: number;
  esPorcentaje: boolean;
  rubroId?: number | null;
  aplicaAutomatico?: boolean;
}

export interface UpdateDiscountData {
  nombre?: string;
  descripcion?: string | null;
  tipoDescuento?: string;
  valor?: number;
  esPorcentaje?: boolean;
  rubroId?: number | null;
  aplicaAutomatico?: boolean;
  activo?: boolean;
}
