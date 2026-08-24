import type { DiscountEntity } from '../entities/discount.entity';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
  DiscountFindManyParams,
} from '../types/discount.types';

export abstract class DiscountRepository {
  abstract createCatalogo(data: CreateDiscountData): Promise<DiscountEntity>;

  abstract findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountEntity[]>;

  abstract countCatalogo(params: { where?: DiscountFilters }): Promise<number>;

  abstract findUniqueCatalogo(id: number): Promise<DiscountEntity | null>;

  abstract updateCatalogo(
    id: number,
    data: UpdateDiscountData,
  ): Promise<DiscountEntity>;

  abstract findRubros(): Promise<
    Array<{
      rubroId: number;
      nombre: string;
      tipoRubro: string;
      precioUnitario: number;
    }>
  >;

  // NOTA SC-187: `tx: any` queda intencionalmente. El caso de uso
  // `apply-discount-to-preinvoice.use-case.ts` usa el `tx` directamente
  // (no solo lo pasa al repositorio), lo cual requiere acceso a la
  // API de Prisma. Tipar el contrato del puerto con `TransactionContext`
  // exigiría refactorizar ese caso de uso para invertir la dependencia
  // (el caso de uso debería pasar el `tx` al repositorio, no usarlo
  // directamente). Ese refactor excede el alcance de SC-187 (que es
  // "puertos de dominio") y entra en SC-188 (aislar application de
  // infra). Cuando se haga, este `any` se reemplaza por
  // `TransactionContext` desde `src/shared/domain/types/transaction`.
  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
