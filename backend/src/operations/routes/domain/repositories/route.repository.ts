import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { RouteEntity } from '../entities/route.entity';
import type { ReadingForRouteEntity } from '../entities/reading-for-route.entity';
import type {
  CreateRouteData,
  UpdateRouteData,
  RouteFilters,
} from '../types/route.types';

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
}

export interface MedidorRef {
  medidorId: number;
  serie: string;
}

export interface EligibleReadingsCriteria {
  tipoRuta: string;
  comunidadId: number;
  sectorId?: number;
  periodoId?: number;
  fechaPlanificada?: Date | string;
  search?: string;
}

export abstract class RouteRepository {
  abstract findById(
    rutaId: bigint,
    includeDeleted?: boolean,
  ): Promise<RouteEntity | null>;

  abstract paginateRutas(
    filters: RouteFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<RouteEntity>>;

  abstract create(data: CreateRouteData): Promise<RouteEntity>;

  abstract update(rutaId: bigint, data: UpdateRouteData): Promise<RouteEntity>;

  abstract softDelete(rutaId: bigint): Promise<RouteEntity>;

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
    fechaPlanificada?: Date | null,
    tipoRuta?: string,
  ): Promise<RouteEntity[]>;

  abstract initializeMonthlyReadings(
    comunidadId: number,
    periodoId: number,
    fechaPlanificada: Date,
    sectorId?: number | null,
    rutaId?: bigint | null,
  ): Promise<number>;

  abstract paginateLecturas(
    criteria: EligibleReadingsCriteria,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>>;
}
