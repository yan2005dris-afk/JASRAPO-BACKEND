import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoRuta, TipoRuta, EstadoContrato } from 'src/shared/enums';
import {
  RouteRepository,
  UsuarioRef,
  ComunidadRef,
  SectorRef,
  PeriodoRef,
  MedidorRef,
  EligibleReadingsCriteria,
} from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
import { RouteMapper } from '../mappers/route.mapper';
import { ReadingForRouteMapper } from '../mappers/reading-for-route.mapper';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { CreateRouteData } from '../../domain/types/create-route-data';
import type { UpdateRouteData } from '../../domain/types/update-route-data';
import type { RouteFilters } from '../../domain/types/route-filters';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaRouteRepository implements RouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    rutaId: bigint,
    includeDeleted: boolean = false,
  ): Promise<RouteEntity | null> {
    const raw = await this.prisma.rutas.findFirst({
      where: {
        rutaId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    return raw ? RouteMapper.toEntity(raw) : null;
  }

  async paginateRutas(
    filters: RouteFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<RouteEntity>> {
    const where: Prisma.RutasWhereInput = {
      deletedAt: null,
      ...(filters.estado ? { estado: filters.estado as EstadoRuta } : {}),
      ...(filters.operarioId !== undefined
        ? { operarioId: filters.operarioId }
        : {}),
      ...(filters.comunidadId !== undefined
        ? { comunidadId: filters.comunidadId }
        : {}),
      ...(filters.tipoRuta ? { tipoRuta: filters.tipoRuta as TipoRuta } : {}),
    };

    const result = await paginate<any>(
      this.prisma.rutas,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return {
      data: RouteMapper.toEntityList(result.data),
      meta: result.meta,
    };
  }

  async create(data: CreateRouteData): Promise<RouteEntity> {
    try {
      const raw = await this.prisma.rutas.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          operario: { connect: { usuarioId: data.operarioId } },
          tipoRuta: data.tipoRuta as TipoRuta,
          comunidad: { connect: { comunidadId: data.comunidadId } },
          sector: data.sectorId
            ? { connect: { sectorId: data.sectorId } }
            : undefined,
          periodo: data.periodoId
            ? { connect: { periodoId: data.periodoId } }
            : undefined,
          medidor: data.medidorId
            ? { connect: { medidorId: BigInt(data.medidorId) } }
            : undefined,
          fechaPlanificada: data.fechaPlanificada ?? null,
          estado: (data.estado ?? 'PENDIENTE') as EstadoRuta,
        },
      });
      return RouteMapper.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Ruta', data.nombre);
      }
      throw error;
    }
  }

  async update(
    rutaId: bigint,
    data: UpdateRouteData,
  ): Promise<RouteEntity> {
    try {
      const raw = await this.prisma.rutas.update({
        where: { rutaId },
        data: {
          ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
          ...(data.descripcion !== undefined
            ? { descripcion: data.descripcion }
            : {}),
          ...(data.operarioId !== undefined
            ? { operario: { connect: { usuarioId: data.operarioId } } }
            : {}),
          ...(data.estado !== undefined
            ? { estado: data.estado as EstadoRuta }
            : {}),
          ...(data.fechaPlanificada !== undefined
            ? { fechaPlanificada: data.fechaPlanificada }
            : {}),
          ...(data.periodoId !== undefined
            ? { periodo: { connect: { periodoId: data.periodoId } } }
            : {}),
        },
      });
      return RouteMapper.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Ruta', rutaId.toString());
      }
      throw error;
    }
  }

  async softDelete(rutaId: bigint): Promise<RouteEntity> {
    try {
      const raw = await this.prisma.rutas.update({
        where: { rutaId },
        data: { deletedAt: new Date() },
      });
      return RouteMapper.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Ruta', rutaId.toString());
      }
      throw error;
    }
  }

  async findUsuario(
    usuarioId: number,
    options?: { includeRole?: boolean },
  ): Promise<UsuarioRef | null> {
    return this.prisma.usuarios.findUnique({
      where: { usuarioId },
      include: options?.includeRole ? { rol: true } : undefined,
    });
  }

  async findComunidad(comunidadId: number): Promise<ComunidadRef | null> {
    return this.prisma.comunidades.findUnique({
      where: { comunidadId },
    });
  }

  async findSector(sectorId: number): Promise<SectorRef | null> {
    return this.prisma.sectores.findUnique({
      where: { sectorId },
    }) as Promise<SectorRef | null>;
  }

  async findPeriodo(periodoId: number): Promise<PeriodoRef | null> {
    return this.prisma.periodos.findUnique({
      where: { periodoId },
    });
  }

  async findMedidor(medidorId: number): Promise<MedidorRef | null> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId: BigInt(medidorId) },
      select: { medidorId: true, serie: true },
    });

    if (!medidor) return null;

    return {
      medidorId: Number(medidor.medidorId),
      serie: medidor.serie,
    };
  }

  async findOverlappingRoutes(
    comunidadId: number,
    periodoId: number,
    sectorId?: number,
  ): Promise<RouteEntity[]> {
    const where: Prisma.RutasWhereInput = {
      comunidadId,
      periodoId,
      deletedAt: null,
    };

    if (sectorId != null) {
      where.OR = [{ sectorId: null }, { sectorId }];
    }

    const records = await this.prisma.rutas.findMany({ where });
    return RouteMapper.toEntityList(records);
  }

  async paginateLecturas(
    criteria: EligibleReadingsCriteria,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const { tipoRuta, comunidadId, sectorId, search } = criteria;
    const estadoContratoEsperado: EstadoContrato =
      tipoRuta === 'TOMA_LECTURA'
        ? EstadoContrato.ACTIVO
        : EstadoContrato.RECONEXION;

    const where: Prisma.LecturasWhereInput = {
      estadoAsignacion: 'NO_ASIGNADA',
      estado: { in: ['PENDIENTE', 'POR_REVISION'] },
      deletedAt: null,
      medidor: {
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              estado: estadoContratoEsperado,
              comunidadId,
              ...(sectorId && { sectorId }),
              deletedAt: null,
            },
          },
        },
      },
    };

    const q = search?.trim();
    if (q) {
      where.OR = [
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: { numeroGuia: { contains: q, mode: 'insensitive' } },
              },
            },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: {
                  cliente: { nombres: { contains: q, mode: 'insensitive' } },
                },
              },
            },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: {
                  cliente: { apellidos: { contains: q, mode: 'insensitive' } },
                },
              },
            },
          },
        },
      ];
    }

    const result = await paginate<any>(
      this.prisma.lecturas,
      {
        where,
        include: {
          medidor: {
            include: {
              historial: {
                where: { fechaHasta: null },
                include: {
                  contrato: { include: { cliente: true, sector: true } },
                },
              },
            },
          },
        } satisfies Prisma.LecturasInclude,
        orderBy: [{ medidor: { historial: { _count: 'desc' } } }],
      },
      pagination,
    );

    return {
      data: ReadingForRouteMapper.toEntityList(result.data),
      meta: result.meta,
    };
  }
}
