import type {
  ReadingWithContractDetail,
  MeterWithContractDetail,
  OperatorRoute,
  OperatorWorkOrder,
  ReadingWithAnomalies,
  RouteStateUpdate,
  OperatorUser,
  SyncCursorPosition,
  SyncSnapshotContext,
  SyncPage,
  SyncChangePage,
} from './repository-types';

export interface RouteData {
  rutaId?: bigint;
  comunidadId: number;
  sectorId: number | null;
}

export interface ActivePeriod {
  periodoId: number;
}

export interface ReadingWithDetails {
  lecturaId: bigint;
  estado: string;
  ordenesTrabajo?: Array<{
    rutaId: bigint;
    operarioId?: number;
    ruta?: {
      operarioId: number | null;
      periodoId: number | null;
    } | null;
  }>;
  medidor: {
    historial: Array<{
      contrato: {
        contratoId: bigint;
        comunidadId: number;
        sectorId: number | null;
      } | null;
    }>;
  } | null;
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
  abstract findReadingsByPeriodAndRoutes(
    periodoId: number,
    routes: RouteData[],
  ): Promise<ReadingWithContractDetail[]>;
  abstract findMetersByRoutes(
    routes: RouteData[],
  ): Promise<MeterWithContractDetail[]>;
  abstract findReadingWithDetails(
    id: bigint,
  ): Promise<ReadingWithDetails | null>;

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
  abstract getMaxOrdenInZona(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<number>;
  abstract findMeterContractLocation(medidorId: bigint): Promise<{
    serie: string;
    comunidadId: number;
    sectorId: number | null;
  } | null>;
  abstract findReadingsWithPendingAnomalies(
    operarioId: number,
    periodoId: number,
  ): Promise<ReadingWithAnomalies[]>;

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
}
