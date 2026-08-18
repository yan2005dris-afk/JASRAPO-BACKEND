import type { EstadoPeriodo } from 'src/generated/prisma/enums';

export interface CreatePeriodData {
  nombre: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  fechaVencimiento: Date | string;
  estado?: EstadoPeriodo;
}

export interface UpdatePeriodData {
  nombre?: string;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  fechaVencimiento?: Date | string;
  estado?: EstadoPeriodo;
}

export interface PeriodFilters {
  nombre?: string;
  search?: string;
  estado?: EstadoPeriodo;
  fechaInicioDesde?: Date | string;
  fechaInicioHasta?: Date | string;
}

export interface PeriodRelationCounts {
  lecturas: number;
  prefacturas: number;
  lotes: number;
  rutas: number;
}
