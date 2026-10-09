import type { TipoRubro } from '../../../../shared/enums';

/**
 * Re-export canonico de `RubroRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/rubro.include.ts`
 * (donde vive `rubroInclude`, el detalle Prisma), pero el dominio
 * consume `RubroRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { RubroRow } from '../../infrastructure/repositories/rubro.include';

export interface RubroFilters {
  nombre?: string;
  tipoRubro?: TipoRubro;
  tarifaImpuestoId?: number;
  categoriaTarifaId?: number;
  activo?: boolean;
  esAutomatico?: boolean;
}

export interface RubroOrderBy {
  rubroId?: 'asc' | 'desc';
  nombre?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

export interface RubroFindManyParams {
  where?: RubroFilters;
  orderBy?: RubroOrderBy;
  skip?: number;
  take?: number;
}

export interface CreateRubroData {
  codigoSri?: string | null;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  tipoRubro: TipoRubro;
  tarifaImpuestoId: number;
  categoriaTarifaId?: number | null;
  activo?: boolean;
  esAutomatico?: boolean;
}

export interface UpdateRubroData {
  codigoSri?: string | null;
  nombre?: string;
  descripcion?: string;
  precioUnitario?: number;
  tipoRubro?: TipoRubro;
  tarifaImpuestoId?: number;
  categoriaTarifaId?: number | null;
  activo?: boolean;
  esAutomatico?: boolean;
  deletedAt?: Date | null;
}

/**
 * Read-model de la relation `tarifaImpuesto` proyectado a un shape
 * plano (sin `relation: tarifaImpuesto { ... }` anidado). Lo retorna
 * `findTarifasImpuesto()` para alimentar listados de impuestos.
 */
export interface TarifaImpuestoInfo {
  id: number;
  impuestoId: number;
  codigoPorcentaje: string;
  descripcion: string;
  porcentaje: number;
  activo: boolean;
}
