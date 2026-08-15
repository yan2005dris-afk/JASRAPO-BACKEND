import type {
  PrefacturaCuotasInfo,
  CuotaConvenioStatus,
} from '../types/payment.types';

export abstract class PrefacturaQueryRepository {
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
