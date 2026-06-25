import type { MeterEntity } from '../entities/meter.entity';

export interface MeterFilters {
  estado?: MeterEntity['estado'];
  marca?: string;
  modelo?: string;
  serie?: string;
  search?: string;
}
