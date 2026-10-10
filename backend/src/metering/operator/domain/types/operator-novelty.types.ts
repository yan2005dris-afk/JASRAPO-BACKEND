/**
 * Re-export canónico de `OperatorNoveltyRow` para los consumidores de dominio.
 *
 * El tipo se declara en
 * `infrastructure/repositories/operator-novelty.include.ts` (donde vive el
 * include Prisma), pero el dominio consume `OperatorNoveltyRow` desde acá.
 * Esto preserva la inversión de dependencias: el dominio no importa nada de
 * `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el único archivo del BC a migrar
 * la firma del re-export.
 */
export type { OperatorNoveltyRow } from '../../infrastructure/repositories/operator-novelty.include';

export interface OperatorNoveltyFilters {
  lecturaId?: bigint;
  ordenTrabajoId?: bigint;
  estado?: string;
}
