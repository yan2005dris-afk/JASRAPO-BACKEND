import type {
  ReadingWithContractDetail,
  MeterWithContractDetail,
  OperatorTask,
  MeterBasicInfo,
  ReadingWithAnomalies,
  OperatorUser,
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
  abstract findActiveRoutes(
    operarioId: number,
    periodoId: number,
  ): Promise<RouteData[]>;
  abstract findReadingsByPeriodAndRoutes(
    periodoId: number,
    routeConditions: Record<string, unknown>[],
  ): Promise<ReadingWithContractDetail[]>;
  abstract findMetersByRoutes(
    routeConditions: Record<string, unknown>[],
  ): Promise<MeterWithContractDetail[]>;
  abstract findReadingWithDetails(
    id: bigint,
  ): Promise<ReadingWithDetails | null>;

  // Task methods (operator-tareas)
  abstract findTasksByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<OperatorTask[]>;
  abstract updateTaskState(
    rutaId: bigint,
    data: Record<string, any>,
    expectedEstado?: string,
  ): Promise<OperatorTask>;

  /** Atomically complete an INSTALACION task and update meter to INSTALADO. */
  abstract completeInstallationTask(
    rutaId: bigint,
    taskUpdateData: Record<string, any>,
    expectedEstado: string,
    meterUpdateData: {
      medidorId: bigint;
      estado: string;
      fechaInstalacion: Date;
    },
  ): Promise<OperatorTask>;
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
  abstract findMedidoresById(medidorIds: bigint[]): Promise<MeterBasicInfo[]>;
  abstract findReadingsWithPendingAnomalies(
    operarioId: number,
    periodoId: number,
  ): Promise<ReadingWithAnomalies[]>;
}
