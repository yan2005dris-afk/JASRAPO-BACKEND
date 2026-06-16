import type { MeterEntity } from '../entities/meter.entity';

export interface MeterFilters {
  estado?: MeterEntity['estado'];
  marca?: string;
  modelo?: string;
  serie?: string;
  buscar?: string; // Search term matching serie, marca, or modelo
}
