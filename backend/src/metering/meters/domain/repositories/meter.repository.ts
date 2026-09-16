import type { MeterEntity } from '../entities/meter.entity';
import type { MeterHistoryEntity } from '../entities/meter-history.entity';
import type { ReemplazoMedidorEntity } from '../entities/reemplazo-medidor.entity';
import type {
  MeterFilters,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
  ReplaceMeterRepositoryData,
  ReplaceMeterResult,
  ApproveMeterReplacementRepositoryData,
} from '../types/meter.types';
import type { TransactionContext } from 'src/shared/domain/types/transaction';

export type {
  MeterFilters,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
  ReplaceMeterRepositoryData,
  ReplaceMeterResult,
  ApproveMeterReplacementRepositoryData,
};
export type { TransactionContext };

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
  ): Promise<{ contratoId: bigint; estadoServicio: string } | null>;

  /** Atomically replace a meter in a contract, recording telemetry,
   *  physical readings, and audit resolution. */
  abstract replaceMeter(
    params: ReplaceMeterRepositoryData,
  ): Promise<ReplaceMeterResult>;

  abstract approveReplacement(
    params: ApproveMeterReplacementRepositoryData,
  ): Promise<ReplaceMeterResult>;

  abstract findHistoryByMeter(medidorId: bigint): Promise<MeterHistoryEntity[]>;

  abstract findReplacementById(
    reemplazoId: bigint,
  ): Promise<ReemplazoMedidorEntity | null>;
}
