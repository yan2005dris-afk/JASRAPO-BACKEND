import type { WorkOrderNoveltyEntity } from '../entities/work-order-novelty.entity';
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
  create(data: CreateWorkOrderNoveltyData): Promise<WorkOrderNoveltyEntity>;
  findById(id: bigint): Promise<WorkOrderNoveltyEntity | null>;
  findByWorkOrderId(workOrderId: bigint): Promise<WorkOrderNoveltyEntity[]>;
  update(
    id: bigint,
    data: UpdateWorkOrderNoveltyData,
  ): Promise<WorkOrderNoveltyEntity>;
  softDelete(
    id: bigint,
    deletedAt: Date,
  ): Promise<WorkOrderNoveltyEntity>;
  findMany(
    filters: WorkOrderNoveltyFilters,
  ): Promise<{ data: WorkOrderNoveltyEntity[]; total: number }>;
}
