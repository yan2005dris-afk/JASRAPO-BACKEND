/**
 * Re-export canonico de `BatchRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/batch.include.ts`
 * (donde vive `batchInclude`, el detalle Prisma), pero el dominio
 * consume `BatchRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { BatchRow } from '../../infrastructure/repositories/batch.include';

export interface BatchCommunityRef {
  comunidadId: number;
  nombre: string;
}

export interface BatchPeriodoRef {
  periodoId: number;
  nombre: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
}

export interface BatchFilters {
  comunidadId?: number;
  periodoId?: number;
  mes?: number;
  rutaId?: bigint | number;
  estado?: string;
}

export interface GenerateBatchData {
  periodoId: number;
  mes?: number;
  comunidadId?: number | null;
  rutaId: bigint | number;
  creadoPor?: string;
}

export interface GenerateBatchResult {
  message: string;
  batchId: number | null;
}
