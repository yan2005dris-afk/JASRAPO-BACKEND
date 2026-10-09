import type { WorkOrderNoveltyRow } from '../../infrastructure/repositories/work-order-novelty.include';
import type {
  EstadoNovedad,
  TipoAnomalia,
  ResolucionEconomicaAnomalia,
} from 'src/shared/enums';

export interface CreateWorkOrderNoveltyData {
  ordenTrabajoId: bigint;
  lecturaId?: bigint | null;
  observacion?: string | null;
  tipo: TipoAnomalia;
  fotoUrl?: string | null;
}

export interface UpdateWorkOrderNoveltyData {
  observacion?: string | null;
  tipo?: TipoAnomalia;
  estado?: EstadoNovedad;
  fotoUrl?: string | null;
  resolucionTipo?: ResolucionEconomicaAnomalia | null;
  consumoAjustado?: number | null;
  observacionResolucion?: string | null;
  resueltoPorUsuarioId?: number | null;
  resueltoEn?: Date | null;
}

export interface WorkOrderNoveltyFilters {
  ordenTrabajoId?: bigint;
  lecturaId?: bigint;
  estado?: EstadoNovedad;
  page?: number;
  limit?: number;
}

export const WORK_ORDER_NOVELTY_REPOSITORY = Symbol(
  'WORK_ORDER_NOVELTY_REPOSITORY',
);

export interface WorkOrderNoveltyRepository {
  create(data: CreateWorkOrderNoveltyData): Promise<WorkOrderNoveltyRow>;
  findById(id: bigint): Promise<WorkOrderNoveltyRow | null>;
  update(
    id: bigint,
    data: UpdateWorkOrderNoveltyData,
  ): Promise<WorkOrderNoveltyRow>;
  softDelete(id: bigint, deletedAt: Date): Promise<WorkOrderNoveltyRow>;
  /**
   * Clears the expected `fotoUrl` after its evidence has been deleted from
   * storage. The URL condition prevents stale cleanup jobs from clearing a
   * newer evidence reference.
   */
  clearEvidenceReference(id: bigint, expectedFotoUrl: string): Promise<void>;
  findMany(
    filters: WorkOrderNoveltyFilters,
  ): Promise<{ data: WorkOrderNoveltyRow[]; total: number }>;
}
