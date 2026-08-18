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
