import type { Prisma } from 'src/generated/prisma/client';
import { EnsureContractWorkOrderUseCase } from '../application/use-cases/ensure-contract-work-order.use-case';

const defaultUseCase = new EnsureContractWorkOrderUseCase();

/** El contrato debe estar bloqueado por el caller durante toda la transacción. */
export async function ensureContractWorkOrder(
  tx: Prisma.TransactionClient,
  contract: {
    contratoId: bigint;
    numeroGuia: string;
    comunidadId: number;
    sectorId: number | null;
  },
  medidorId: bigint,
  activity: 'INSPECCION' | 'INSTALACION',
) {
  return defaultUseCase.ensureWorkOrder(tx, contract, medidorId, activity);
}
