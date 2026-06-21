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
}
