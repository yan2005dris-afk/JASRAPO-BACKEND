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
  estado?: string;
}

export interface GenerateBatchData {
  periodoId: number;
  comunidadId?: number | null;
  creadoPor?: string;
}

export interface GenerateBatchResult {
  message: string;
  batchId: number | null;
}
