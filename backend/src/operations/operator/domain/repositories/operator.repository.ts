import type {
  MeterWithContractDetail,
  OperatorRoute,
  OperatorWorkOrder,
  ReadingWithAnomalies,
  ReadingWithContractDetail,
  RouteStateUpdate,
  OperatorUser,
  SyncCursorPosition,
  SyncSnapshotContext,
  SyncPage,
  SyncChangePage,
} from './repository-types';
import type {
  OperatorNoveltyFilters,
  OperatorNoveltyRow,
} from '../types/operator-novelty.types';

export interface RouteData {
  rutaId?: bigint;
  comunidadId: number;
  sectorId: number | null;
  estado?: string;
}

export interface ActivePeriod {
  periodoId: number;
}

export abstract class OperatorRepository {
  abstract findActivePeriod(): Promise<ActivePeriod | null>;
  abstract verifyMeterOwnership(
    operarioId: number,
    medidorId: bigint,
  ): Promise<void>;
  abstract findActiveRoutes(
    operarioId: number,
    periodoId: number,
  ): Promise<RouteData[]>;
  abstract findMetersByRoutes(
    routes: RouteData[],
  ): Promise<MeterWithContractDetail[]>;

  abstract findRoutesByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<OperatorRoute[]>;
  abstract updateRouteState(
    rutaId: bigint,
    data: RouteStateUpdate,
    expectedEstado?: string,
  ): Promise<OperatorRoute>;
  abstract findOperatorsByGeography(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<OperatorUser[]>;
  abstract findMeterContractLocation(medidorId: bigint): Promise<{
    serie: string;
    comunidadId: number;
    sectorId: number | null;
  } | null>;

  abstract findSyncRoutes(
    operarioId: number,
    periodoId: number,
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<OperatorRoute>>;
  abstract findSyncWorkOrders(
    operarioId: number,
    periodoId: number,
    routeIds: bigint[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<OperatorWorkOrder>>;
  abstract findSyncMeters(
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<MeterWithContractDetail>>;
  abstract findSyncReadings(
    periodoId: number,
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<ReadingWithContractDetail>>;
  abstract findSyncPendingAnomalies(
    operarioId: number,
    periodoId: number,
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<ReadingWithAnomalies>>;
  abstract getSyncWatermark(): Promise<bigint>;
  abstract getSyncSnapshotContext(): Promise<SyncSnapshotContext>;
  abstract findSyncChanges(
    periodoId: number,
    routes: RouteData[],
    afterSequence: bigint,
    limit: number,
  ): Promise<SyncChangePage>;

  abstract findOperatorNovelties(params: {
    operarioId: number;
    page: number;
    limit: number;
    filters?: OperatorNoveltyFilters;
  }): Promise<{ data: OperatorNoveltyRow[]; total: number }>;
  abstract findOperatorNovelty(
    operarioId: number,
    novedadId: bigint,
  ): Promise<OperatorNoveltyRow | null>;
}
