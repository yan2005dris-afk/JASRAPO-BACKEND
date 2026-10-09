import type { EstadoPeriodo } from 'src/shared/enums';

/**
 * Re-export canonico de `PeriodRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/period.include.ts`
 * (donde vive `periodInclude`, el detalle Prisma), pero el dominio
 * consume `PeriodRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { PeriodRow } from '../../infrastructure/repositories/period.include';

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
