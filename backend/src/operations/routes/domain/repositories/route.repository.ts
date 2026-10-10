import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type {
  RouteRow,
  ReadingForRouteRow,
} from '../../infrastructure/repositories/route.include';
import type {
  CreateRouteData,
  UpdateRouteData,
  RouteFilters,
} from '../types/route.types';
import type { LecturaKpis } from '../types/orden-trabajo.types';

/**
 * Cross-module lookup interfaces — minimal shapes for domain validation.
 * The Prisma repository returns these shapes from other modules' tables.
 */
export interface UsuarioRef {
  usuarioId: number;
  rol?: { nombre?: string } | null;
}

export interface ComunidadRef {
  comunidadId: number;
  nombre?: string;
}

export interface SectorRef {
  sectorId: number;
  comunidadId: number;
  nombre?: string;
}

export interface PeriodoRef {
  periodoId: number;
  nombre?: string;
  estado: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
}

export interface TipoActividadRef {
  tipoActividadId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface MedidorRef {
  medidorId: number;
  serie: string;
}

export interface ContratoRef {
  contratoId: number;
  numeroGuia: string;
  comunidadId: number;
  sectorId?: number | null;
}

export interface EligibleReadingsCriteria {
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number;
  periodoId?: number;
  search?: string;
}

export abstract class RouteRepository {
  abstract findById(
    rutaId: bigint,
    includeDeleted?: boolean,
  ): Promise<RouteRow | null>;

  abstract paginateRutas(
    filters: RouteFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<RouteRow>>;

  abstract create(data: CreateRouteData): Promise<RouteRow>;

  abstract update(rutaId: bigint, data: UpdateRouteData): Promise<RouteRow>;

  abstract updateWithReadingKpis(
    rutaId: bigint,
    expectedEstado: string,
    data: UpdateRouteData,
  ): Promise<RouteRow>;

  abstract softDelete(rutaId: bigint): Promise<RouteRow>;

  abstract findUsuario(
    usuarioId: number,
    options?: { includeRole?: boolean },
  ): Promise<UsuarioRef | null>;

  abstract findComunidad(comunidadId: number): Promise<ComunidadRef | null>;

  abstract findSector(sectorId: number): Promise<SectorRef | null>;

  abstract findPeriodo(periodoId: number): Promise<PeriodoRef | null>;

  abstract findAllPeriodos(): Promise<PeriodoRef[]>;

  abstract findMedidor(medidorId: number): Promise<MedidorRef | null>;

  abstract findOverlappingRoutes(
    comunidadId: number,
    periodoId: number,
    sectorId?: number,
    tipoRuta?: string,
  ): Promise<RouteRow[]>;

  abstract initializeMonthlyReadings(
    comunidadId: number,
    periodoId: number,
    fechaReferencia: Date,
    sectorId?: number | null,
    rutaId?: bigint | null,
  ): Promise<number>;

  abstract paginateLecturas(
    criteria: EligibleReadingsCriteria,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteRow>>;

  abstract paginateLecturasByRutaId(
    rutaId: bigint,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteRow, LecturaKpis>>;

  abstract getReadingKpisByRutaId(rutaId: bigint): Promise<LecturaKpis>;

  abstract createWorkOrdersForContracts(
    rutaId: bigint,
    contratoIds: number[],
  ): Promise<void>;

  abstract findContratosByIds(contratoIds: number[]): Promise<ContratoRef[]>;

  abstract findAllTiposActividad(): Promise<TipoActividadRef[]>;
}
