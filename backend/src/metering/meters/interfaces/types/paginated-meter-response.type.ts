import type { MeterResponseDto } from '../dto/meter-response.dto';

export interface MeterKpis {
  enBodega: number;
  instalados: number;
  danados: number;
  total: number;
}

export interface PaginatedMeterResponse {
  data: MeterResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    ultimaPagina: number;
    paginaActual: number;
    porPagina: number;
    anterior: number | null;
    siguiente: number | null;
  };
  kpis: MeterKpis;
}
