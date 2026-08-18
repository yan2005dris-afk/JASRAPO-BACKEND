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
import type {
  CreateRouteData,
  UpdateRouteData,
  RouteFilters,
} from '../../domain/types/route.types';
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
      ...(filters.periodoId !== undefined
        ? { periodoId: filters.periodoId }
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

  async update(rutaId: bigint, data: UpdateRouteData): Promise<RouteEntity> {
    try {
      const raw = await this.prisma.rutas.update({
        where: { rutaId },
        data: {
          ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
          ...(data.descripcion !== undefined
            ? { descripcion: data.descripcion }
            : {}),
          ...(data.operarioId !== undefined
            ? { operarioId: data.operarioId }
            : {}),
          ...(data.estado !== undefined
            ? { estado: data.estado as EstadoRuta }
            : {}),
          ...(data.fechaPlanificada !== undefined
            ? { fechaPlanificada: data.fechaPlanificada }
            : {}),
          ...(data.periodoId !== undefined
            ? { periodoId: data.periodoId }
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
      select: {
        periodoId: true,
        nombre: true,
        estado: true,
      },
    });
  }

  async findAllPeriodos(): Promise<PeriodoRef[]> {
    return this.prisma.periodos.findMany({
      select: {
        periodoId: true,
        nombre: true,
        estado: true,
      },
      orderBy: { fechaInicio: 'desc' },
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
    fechaPlanificada?: Date | null,
    tipoRuta?: string,
  ): Promise<RouteEntity[]> {
    const where: Prisma.RutasWhereInput = {
      comunidadId,
      periodoId,
      deletedAt: null,
      ...(tipoRuta ? { tipoRuta: tipoRuta as any } : {}),
    };

    if (sectorId != null) {
      where.OR = [{ sectorId: null }, { sectorId }];
    }

    if (fechaPlanificada) {
      const year = fechaPlanificada.getFullYear();
      const month = fechaPlanificada.getMonth();
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      where.fechaPlanificada = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const records = await this.prisma.rutas.findMany({ where });
    return RouteMapper.toEntityList(records);
  }

  async initializeMonthlyReadings(
    comunidadId: number,
    periodoId: number,
    fechaPlanificada: Date,
    sectorId?: number | null,
    rutaId?: bigint | null,
  ): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT public.inicializar_lecturas_ruta($1, $2, $3, $4, $5) as count`,
      comunidadId,
      periodoId,
      fechaPlanificada,
      sectorId ?? null,
      rutaId ?? null,
    );

    return Number(result[0]?.count ?? 0);
  }

  async paginateLecturas(
    criteria: EligibleReadingsCriteria,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const { tipoRuta, comunidadId, sectorId, periodoId, fechaPlanificada, search } = criteria;
    const estadoContratoEsperado: EstadoContrato =
      tipoRuta === 'TOMA_LECTURA'
        ? EstadoContrato.ACTIVO
        : EstadoContrato.RECONEXION;

    const where: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ...(periodoId ? { periodoId } : {}),
      medidor: {
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              comunidadId,
              ...(sectorId ? { sectorId } : {}),
              deletedAt: null,
            },
          },
        },
      },
    };

    if (fechaPlanificada) {
      const planDate = new Date(fechaPlanificada);
      const year = planDate.getUTCFullYear();
      const month = planDate.getUTCMonth();
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      where.fecha = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

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

    const [result, estadoGroups] = await Promise.all([
      paginate<any>(
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
      ),
      this.prisma.lecturas.groupBy({
        by: ['estado'],
        where,
        _count: { _all: true },
      }),
    ]);

    const countByEstado = new Map<string, number>(
      estadoGroups.map((g) => [g.estado, g._count._all]),
    );

    return {
      data: ReadingForRouteMapper.toEntityList(result.data),
      meta: result.meta,
      kpis: {
        total: result.meta.total,
        aprobadas: countByEstado.get('APROBADA') ?? 0,
        pendientes: (countByEstado.get('PENDIENTE') ?? 0) + (countByEstado.get('POR_REVISION') ?? 0),
        conNovedad: countByEstado.get('CON_NOVEDAD') ?? 0,
        rechazadas: countByEstado.get('RECHAZADA_VERIFICACION') ?? 0,
      },
    };
  }
}
