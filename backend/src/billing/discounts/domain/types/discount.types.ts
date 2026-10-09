/**
 * Re-export canonico de `DiscountRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/discount.include.ts`
 * (donde vive `discountInclude`, el detalle Prisma), pero el dominio
 * consume `DiscountRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { DiscountRow } from '../../infrastructure/repositories/discount.include';

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
