import type { MeterEntity } from '../entities/meter.entity';
import type { MeterFilters } from '../types/meter-filters';

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

export abstract class MeterRepository {
  abstract findUnique(where: {
    medidorId?: bigint;
    serie?: string;
  }): Promise<MeterEntity | null>;

  abstract findMany(params: {
    where?: MeterFilters;
    take?: number;
    skip?: number;
  }): Promise<MeterEntity[]>;

  abstract count(where?: MeterFilters): Promise<number>;

  abstract create(data: CreateMeterRepositoryData): Promise<MeterEntity>;

  abstract update(
    where: { medidorId: bigint },
    data: UpdateMeterRepositoryData,
    tx?: any,
  ): Promise<MeterEntity>;

  abstract createHistory(
    data: CreateMeterHistoryRepositoryData,
    tx?: any,
  ): Promise<void>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;

  abstract findActiveContractForMeter(
    medidorId: bigint,
  ): Promise<{ contratoId: bigint; estado: string } | null>;
}
