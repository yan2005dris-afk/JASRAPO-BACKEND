import type {
  MeterRow,
  MeterHistoryRow,
  ReemplazoMedidorRow,
} from '../../infrastructure/repositories/meter.include';
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
  }): Promise<MeterRow | null>;

  abstract findMany(params: {
    where?: MeterFilters;
    take?: number;
    skip?: number;
  }): Promise<MeterRow[]>;

  abstract count(where?: MeterFilters): Promise<number>;

  abstract groupByEstado(
    where?: MeterFilters,
  ): Promise<Array<{ estado: MeterRow['estado']; _count: { _all: number } }>>;

  abstract create(data: CreateMeterRepositoryData): Promise<MeterRow>;

  abstract update(
    where: { medidorId: bigint },
    data: UpdateMeterRepositoryData,
    tx?: TransactionContext,
  ): Promise<MeterRow>;

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

  abstract findHistoryByMeter(medidorId: bigint): Promise<MeterHistoryRow[]>;

  abstract findReplacementById(
    reemplazoId: bigint,
  ): Promise<ReemplazoMedidorRow | null>;
}
