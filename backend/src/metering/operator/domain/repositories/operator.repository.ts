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
  ): Promise<any[]>;
  abstract findMetersByRoutes(
    routeConditions: Record<string, unknown>[],
  ): Promise<any[]>;
  abstract findReadingWithDetails(
    id: bigint,
  ): Promise<ReadingWithDetails | null>;

  // Task methods (operator-tareas)
  abstract findTasksByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<any[]>;
  abstract updateTaskState(
    rutaId: bigint,
    data: Record<string, any>,
  ): Promise<any>;
  abstract findOperatorsByGeography(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<any[]>;
  abstract getMaxOrdenInZona(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<number>;
  abstract findMeterContractLocation(medidorId: bigint): Promise<{
    serie: string;
    comunidadId: number;
    sectorId: number | null;
  } | null>;
  abstract findMedidoresById(medidorIds: bigint[]): Promise<any[]>;
}
