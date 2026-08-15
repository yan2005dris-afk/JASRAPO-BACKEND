import type { MeterEntity } from '../entities/meter.entity';
import type {
  MeterFilters,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
} from '../types/meter.types';

export type {
  MeterFilters,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
};

export type TransactionContext = any;

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

  abstract groupByEstado(
    where?: MeterFilters,
  ): Promise<
    Array<{ estado: MeterEntity['estado']; _count: { _all: number } }>
  >;

  abstract create(data: CreateMeterRepositoryData): Promise<MeterEntity>;

  abstract update(
    where: { medidorId: bigint },
    data: UpdateMeterRepositoryData,
    tx?: TransactionContext,
  ): Promise<MeterEntity>;

  abstract createHistory(
    data: CreateMeterHistoryRepositoryData,
    tx?: TransactionContext,
  ): Promise<void>;

  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;

  abstract findActiveContractForMeter(
    medidorId: bigint,
  ): Promise<{ contratoId: bigint; estado: string } | null>;
}
