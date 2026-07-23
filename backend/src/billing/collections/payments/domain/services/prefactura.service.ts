import type { Prisma } from 'src/generated/prisma/client';

/**
 * Service contract for querying prefactura and cuota-convenio data
 * within the payments bounded context.
 *
 * Extracted from PaymentRepository so CuotaPagadaHandler depends on a
 * domain service rather than the repository directly (cleaner SRP).
 */
export abstract class PrefacturaService {
  abstract findPrefacturaDetalleByCuotaConvenioId(
    cuotaConvenioId: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<any[]>;

  abstract findPrefacturaById(
    prefacturaId: bigint,
    select?: any,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract findManyCuotaConvenio(
    where: Prisma.CuotaConvenioWhereInput,
    select?: any,
    tx?: Prisma.TransactionClient,
  ): Promise<any[]>;
}
