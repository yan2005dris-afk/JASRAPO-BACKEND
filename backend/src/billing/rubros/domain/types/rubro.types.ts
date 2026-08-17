import type { TipoRubro } from 'src/generated/prisma/client';

export interface RubroFilters {
  nombre?: string;
  tipoRubro?: TipoRubro;
  tarifaImpuestoId?: number;
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
  activo?: boolean;
  esAutomatico?: boolean;
  deletedAt?: Date | null;
}

export interface TarifaImpuestoInfo {
  id: number;
  impuestoId: number;
  codigoPorcentaje: string;
  descripcion: string;
  porcentaje: number;
  activo: boolean;
}
