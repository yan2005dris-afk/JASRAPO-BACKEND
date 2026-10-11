import type { OrdenTrabajoRow } from 'src/operations/routes/infrastructure/repositories/route.include';
import type {
  OrdenTrabajoFilters,
  OrdenTrabajoKpis,
  UpdateOrdenEstadoData,
  LinkLecturaData,
  CreateOrdenTrabajoData,
  UpdateOperatorWorkOrderData,
} from '../types/orden-trabajo.types';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';

export abstract class OrdenTrabajoRepository {
  abstract assignInstallationRoute(
    contratoId: bigint,
    routeId?: bigint,
  ): Promise<bigint>;

  abstract findById(
    ordenTrabajoId: bigint,
    includeDeleted?: boolean,
  ): Promise<OrdenTrabajoRow | null>;

  abstract findByRutaId(
    rutaId: bigint,
    filters: OrdenTrabajoFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<OrdenTrabajoRow, OrdenTrabajoKpis>>;

  abstract updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoRow>;

  abstract verifyOperatorWorkOrderOwnership(
    operarioId: number,
    ordenTrabajoId: bigint,
  ): Promise<void>;

  abstract updateOperatorWorkOrder(
    ordenTrabajoId: bigint,
    data: UpdateOperatorWorkOrderData,
  ): Promise<OrdenTrabajoRow>;

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
  ): Promise<OrdenTrabajoRow>;

  /**
   * Crea una nueva orden de trabajo asociada a una ruta existente.
   * Usado por el flujo "Asignar contrato a ruta de instalación" (SC-174).
   */
  abstract create(data: CreateOrdenTrabajoData): Promise<OrdenTrabajoRow>;
}
