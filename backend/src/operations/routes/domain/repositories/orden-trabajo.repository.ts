import type { OrdenTrabajoEntity } from '../entities/orden-trabajo.entity';
import type {
  OrdenTrabajoFilters,
  UpdateOrdenEstadoData,
  LinkLecturaData,
} from '../types/orden-trabajo.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

export abstract class OrdenTrabajoRepository {
  abstract findById(
    ordenTrabajoId: bigint,
    includeDeleted?: boolean,
  ): Promise<OrdenTrabajoEntity | null>;

  abstract findByRutaId(
    rutaId: bigint,
    filters: OrdenTrabajoFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<OrdenTrabajoEntity>>;

  abstract updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoEntity>;

  /**
   * Vincula una lectura existente a una orden de trabajo.
   * Operación PURA: solo escribe `lecturaId`, no cambia el estado de la orden
   * ni `completadoEn`. Si el caller necesita marcar la orden como completada,
   * debe invocar `updateEstado` por separado.
   *
   * Garantías:
   * - Atomicidad: lectura + update ejecutan en una sola transacción de Prisma.
   * - Integridad de dominio: si la orden tiene `medidorId`, la lectura debe
   *   pertenecer al mismo medidor. Si no coincide, lanza InvalidDomainOperation.
   * - 404 si la orden o la lectura no existen.
   */
  abstract linkLectura(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
  ): Promise<OrdenTrabajoEntity>;
}
