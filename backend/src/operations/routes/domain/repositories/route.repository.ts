import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { RouteEntity } from '../entities/route.entity';
import type { ReadingForRouteEntity } from '../entities/reading-for-route.entity';
import type { CreateRouteData } from '../types/create-route-data';
import type { UpdateRouteData } from '../types/update-route-data';
import type { RouteFilters } from '../types/route-filters';

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

  abstract findMedidor(medidorId: number): Promise<MedidorRef | null>;

  abstract findOverlappingRoutes(
    comunidadId: number,
    periodoId: number,
    sectorId?: number,
  ): Promise<RouteEntity[]>;

  abstract paginateLecturas(
    criteria: EligibleReadingsCriteria,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>>;
}
