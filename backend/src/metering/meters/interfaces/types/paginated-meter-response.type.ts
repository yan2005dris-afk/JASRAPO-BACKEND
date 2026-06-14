import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { MeterResponseDto } from '../dto/meter-response.dto';

export interface MeterKpis {
  enBodega: number;
  instalados: number;
  danados: number;
  total: number;
}

export interface PaginatedMeterResponse extends PaginatedResult<MeterResponseDto> {
  kpis: MeterKpis;
}
