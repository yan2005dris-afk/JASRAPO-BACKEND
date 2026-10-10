import type { DiscountRow } from '../types/discount.types';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
  DiscountFindManyParams,
} from '../types/discount.types';
import type { TransactionContext } from 'src/shared/domain/types/transaction';

export abstract class DiscountRepository {
  abstract createCatalogo(data: CreateDiscountData): Promise<DiscountRow>;

  abstract findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountRow[]>;

  abstract countCatalogo(params: { where?: DiscountFilters }): Promise<number>;

  abstract findUniqueCatalogo(id: number): Promise<DiscountRow | null>;

  abstract updateCatalogo(
    id: number,
    data: UpdateDiscountData,
  ): Promise<DiscountRow>;

  abstract findRubros(): Promise<
    Array<{
      rubroId: number;
      nombre: string;
      tipoRubro: string;
      precioUnitario: number;
    }>
  >;

  // NOTA SC-187/SC-188: el handle transaccional está tipado como
  // `TransactionContext` (alias canónico de `Prisma.TransactionClient`).
  // El caso de uso `apply-discount-to-preinvoice.use-case.ts` todavía usa
  // el `tx` directamente en application en vez de delegar todo al
  // repositorio; esa inversión de dependencia completa queda para SC-188.
  // Lo que sí queda cerrado acá: ningún `any` en la firma del puerto.
  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
