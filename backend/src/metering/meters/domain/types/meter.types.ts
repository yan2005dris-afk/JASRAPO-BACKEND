import type { MeterEntity } from '../entities/meter.entity';

export interface MeterFilters {
  estado?: MeterEntity['estado'];
  marca?: string;
  modelo?: string;
  serie?: string;
  search?: string;
}

export interface CreateMeterRepositoryData {
  marca: string;
  modelo: string;
  serie: string;
  estado: MeterEntity['estado'];
  latitud?: number | null;
  longitud?: number | null;
}

export interface UpdateMeterRepositoryData {
  marca?: string;
  modelo?: string;
  serie?: string;
  estado?: MeterEntity['estado'];
  fechaInstalacion?: Date | null;
  fechaBaja?: Date | null;
  motivo?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  deletedAt?: Date | null;
}

export interface CreateMeterHistoryRepositoryData {
  medidorId: bigint;
  contratoId: bigint;
  lecturaInicial: number;
  motivo: string;
  fechaDesde: Date;
}
