export interface PrefacturaCuotasInfo {
  prefacturaId: bigint;
  comprobanteId: bigint | null;
  cuotaConvenioIds: bigint[];
}

export interface CuotaConvenioStatus {
  cuotaConvenioId: bigint;
  estado: string;
}

export abstract class PrefacturaService {
  abstract findPrefacturaDetalleByCuotaConvenioId(
    cuotaConvenioId: bigint,
  ): Promise<{ prefacturaId: bigint }[]>;

  abstract findPrefacturaWithDetails(
    prefacturaId: bigint,
  ): Promise<PrefacturaCuotasInfo | null>;

  abstract findCuotasByIds(
    cuotaConvenioIds: bigint[],
  ): Promise<CuotaConvenioStatus[]>;
}
