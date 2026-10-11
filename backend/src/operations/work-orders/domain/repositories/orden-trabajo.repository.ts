import type { OrdenTrabajoRow } from 'src/operations/routes/infrastructure/repositories/route.include';
import type {
  OrdenTrabajoFilters,
  OrdenTrabajoKpis,
  UpdateOrdenEstadoData,
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
   * Crea una nueva orden de trabajo asociada a una ruta existente.
   * Usado por el flujo "Asignar contrato a ruta de instalación" (SC-174).
   */
  abstract create(data: CreateOrdenTrabajoData): Promise<OrdenTrabajoRow>;
}
