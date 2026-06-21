import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { RouteEntity } from '../entities/route.entity';
import type { ReadingForRouteEntity } from '../entities/reading-for-route.entity';
import type { CreateRouteData } from '../types/create-route-data';

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

export abstract class RouteRepository {
  abstract findUnique(where: Record<string, any>): Promise<any>;

  abstract findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract paginateRutas(
    args: { where?: Record<string, any>; orderBy?: Record<string, any> },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<RouteEntity>>;

  abstract create(data: CreateRouteData): Promise<any>;

  abstract update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any>;

  abstract findUsuario(
    where: { usuarioId: number },
    options?: { include?: Record<string, any> },
  ): Promise<UsuarioRef | null>;

  abstract findComunidad(where: {
    comunidadId: number;
  }): Promise<ComunidadRef | null>;

  abstract findSector(where: { sectorId: number }): Promise<SectorRef | null>;

  abstract findPeriodo(where: {
    periodoId: number;
  }): Promise<PeriodoRef | null>;

  abstract findMedidor(where: {
    medidorId: number;
  }): Promise<{ medidorId: number; serie: string } | null>;

  abstract findOverlappingRoutes(
    comunidadId: number,
    periodoId: number,
    sectorId?: number,
  ): Promise<any[]>;

  abstract paginateLecturas(
    args: {
      where?: Record<string, any>;
      orderBy?: any;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>>;
}
