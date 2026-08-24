import type { TransactionContext } from 'src/shared/domain/types/transaction';

export abstract class SecuencialRepository {
  abstract getNextSecuencial(
    puntoEmisionId: number,
    tipoComprobante: string,
    tx?: TransactionContext,
  ): Promise<string>;
}
