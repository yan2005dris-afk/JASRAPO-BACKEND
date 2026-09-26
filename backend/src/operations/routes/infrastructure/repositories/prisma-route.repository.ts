import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoRuta } from 'src/shared/enums';
import {
  RouteRepository,
  UsuarioRef,
  ComunidadRef,
  SectorRef,
  PeriodoRef,
  TipoActividadRef,
  MedidorRef,
  ContratoRef,
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
import type { LecturaKpis } from '../../domain/types/orden-trabajo.types';
import type {
  CreateRouteData,
  UpdateRouteData,
  RouteFilters,
} from '../../domain/types/route.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaRouteRepository implements RouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    rutaId: bigint,
    includeDeleted: boolean = false,
  ): Promise<RouteEntity | null> {
    const raw = await this.prisma.rutas.findFirst({
      include: { tipoActividad: { select: { codigo: true } } },
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
      ...(filters.tipoRuta
        ? { tipoActividad: { codigo: filters.tipoRuta } }
        : {}),
    };

    const result = await paginate<any>(
      this.prisma.rutas,
      {
        where,
        include: { tipoActividad: { select: { codigo: true } } },
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
      const tipoActividad = await this.prisma.tipoActividad.findUnique({
        where: { codigo: data.tipoRuta },
        select: { tipoActividadId: true },
      });
      if (!tipoActividad)
        throw new EntityNotFoundException('Tipo de actividad', data.tipoRuta);
      const raw = await this.prisma.rutas.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          operarioId: data.operarioId ?? null,
          tipoActividadId: tipoActividad.tipoActividadId,
          comunidadId: data.comunidadId,
          sectorId: data.sectorId ?? null,
          periodoId: data.periodoId ?? null,
          fechaPlanificada: data.fechaPlanificada ?? null,
          estado: (data.estado ?? 'PENDIENTE') as EstadoRuta,
        },
        include: { tipoActividad: { select: { codigo: true } } },
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
      const tipoActividad = data.tipoRuta
        ? await this.prisma.tipoActividad.findUnique({
            where: { codigo: data.tipoRuta },
            select: { tipoActividadId: true },
          })
        : null;
      if (data.tipoRuta && !tipoActividad)
        throw new EntityNotFoundException('Tipo de actividad', data.tipoRuta);
      const updateData: Prisma.RutasUncheckedUpdateInput = {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.descripcion !== undefined
          ? { descripcion: data.descripcion }
          : {}),
        ...(data.operarioId !== undefined
          ? { operarioId: data.operarioId }
          : {}),
        ...(data.tipoRuta !== undefined
          ? { tipoActividadId: tipoActividad!.tipoActividadId }
          : {}),
        ...(data.comunidadId !== undefined
          ? { comunidadId: data.comunidadId }
          : {}),
        ...(data.sectorId !== undefined ? { sectorId: data.sectorId } : {}),
        ...(data.periodoId !== undefined ? { periodoId: data.periodoId } : {}),
        ...(data.estado !== undefined
          ? { estado: data.estado as EstadoRuta }
          : {}),
        ...(data.fechaPlanificada !== undefined
          ? { fechaPlanificada: data.fechaPlanificada }
          : {}),
        ...(data.fechaInicio !== undefined
          ? { fechaInicio: data.fechaInicio }
          : {}),
        ...(data.fechaFin !== undefined ? { fechaFin: data.fechaFin } : {}),
      };
      const raw = await this.prisma.rutas.update({
        where: { rutaId },
        data: updateData,
        include: { tipoActividad: { select: { codigo: true } } },
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

  async updateWithReadingKpis(
    rutaId: bigint,
    expectedEstado: string,
    data: UpdateRouteData,
  ): Promise<RouteEntity> {
    return this.prisma.$transaction(
      async (tx) => {
        const route = await tx.rutas.findFirst({
          where: {
            rutaId,
            estado: expectedEstado as EstadoRuta,
            deletedAt: null,
          },
          include: { tipoActividad: { select: { codigo: true } } },
        });
        if (!route) {
          throw new InvalidDomainOperationException(
            'La ruta fue modificada por otro usuario. Intentalo de nuevo.',
          );
        }

        let estado = data.estado;
        if (
          data.estado === 'COMPLETADA' &&
          route.tipoActividad.codigo === 'LECTURA'
        ) {
          const estadoGroups = await tx.lecturas.groupBy({
            by: ['estado'],
            where: {
              deletedAt: null,
              ordenesTrabajo: {
                some: {
                  rutaId,
                  ruta: { tipoActividad: { codigo: 'LECTURA' } },
                  deletedAt: null,
                },
              },
            },
            _count: { _all: true },
          });
          const total = estadoGroups.reduce(
            (sum, group) => sum + group._count._all,
            0,
          );
          const aprobadas =
            estadoGroups.find((group) => group.estado === 'APROBADA')?._count
              ._all ?? 0;
          if (total > aprobadas) estado = 'PARCIAL';
        }

        const raw = await tx.rutas.update({
          where: { rutaId },
          data: {
            ...(data.nombre !== undefined && { nombre: data.nombre }),
            ...(data.descripcion !== undefined && {
              descripcion: data.descripcion,
            }),
            ...(data.operarioId !== undefined && {
              operarioId: data.operarioId,
            }),
            ...(data.comunidadId !== undefined && {
              comunidadId: data.comunidadId,
            }),
            ...(data.sectorId !== undefined && { sectorId: data.sectorId }),
            ...(data.periodoId !== undefined && { periodoId: data.periodoId }),
            ...(estado !== undefined && { estado: estado as EstadoRuta }),
            ...(data.fechaPlanificada !== undefined && {
              fechaPlanificada: data.fechaPlanificada,
            }),
            ...(data.fechaInicio !== undefined && {
              fechaInicio: data.fechaInicio,
            }),
            ...(data.fechaFin !== undefined && { fechaFin: data.fechaFin }),
          },
          include: { tipoActividad: { select: { codigo: true } } },
        });
        return RouteMapper.toEntity(raw);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async softDelete(rutaId: bigint): Promise<RouteEntity> {
    try {
      const raw = await this.prisma.rutas.update({
        where: { rutaId },
        data: { deletedAt: new Date() },
        include: { tipoActividad: { select: { codigo: true } } },
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
    tipoRuta?: string,
  ): Promise<RouteEntity[]> {
    const where: Prisma.RutasWhereInput = {
      comunidadId,
      periodoId,
      deletedAt: null,
      ...(tipoRuta ? { tipoActividad: { codigo: tipoRuta } } : {}),
    };

    if (sectorId != null) {
      where.OR = [{ sectorId: null }, { sectorId }];
    }

    const records = await this.prisma.rutas.findMany({
      include: { tipoActividad: { select: { codigo: true } } },
      where,
    });
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
    const { comunidadId, sectorId, periodoId, fechaPlanificada, search } =
      criteria;
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
      const endOfMonth = new Date(
        Date.UTC(year, month + 1, 0, 23, 59, 59, 999),
      );

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
        pendientes:
          (countByEstado.get('PENDIENTE') ?? 0) +
          (countByEstado.get('POR_REVISION') ?? 0),
        conNovedad: countByEstado.get('CON_NOVEDAD') ?? 0,
        rechazadas: countByEstado.get('RECHAZADA_VERIFICACION') ?? 0,
      },
    };
  }

  async paginateLecturasByRutaId(
    rutaId: bigint,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity, LecturaKpis>> {
    // Filtramos lecturas a través de la relación reversa con ordenes_trabajo,
    // no al revés. Esto garantiza:
    //   (a) que la lectura realmente existe (FK consistente),
    //   (b) que los kpis se computan sobre `lectura.estado` (EstadoLectura)
    //       y no sobre `orden.estado` (EstadoOrdenTrabajo) — son enums distintos.
    const where: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ordenesTrabajo: {
        some: {
          rutaId,
          ruta: { tipoActividad: { codigo: 'LECTURA' } },
          deletedAt: null,
        },
      },
    };

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
          orderBy: { fecha: 'desc' },
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
        pendientes:
          (countByEstado.get('PENDIENTE') ?? 0) +
          (countByEstado.get('POR_REVISION') ?? 0) +
          (countByEstado.get('ESTIMADA') ?? 0) +
          (countByEstado.get('PLANILLADA') ?? 0),
        conNovedad: countByEstado.get('CON_NOVEDAD') ?? 0,
        rechazadas: countByEstado.get('RECHAZADA_VERIFICACION') ?? 0,
      },
    };
  }

  async getReadingKpisByRutaId(rutaId: bigint): Promise<LecturaKpis> {
    const where: Prisma.LecturasWhereInput = {
      deletedAt: null,
      ordenesTrabajo: {
        some: {
          rutaId,
          ruta: { tipoActividad: { codigo: 'LECTURA' } },
          deletedAt: null,
        },
      },
    };

    const estadoGroups = await this.prisma.lecturas.groupBy({
      by: ['estado'],
      where,
      _count: { _all: true },
    });

    const countByEstado = new Map<string, number>(
      estadoGroups.map((g) => [g.estado, g._count._all]),
    );

    const total = estadoGroups.reduce((acc, g) => acc + g._count._all, 0);

    return {
      total,
      aprobadas: countByEstado.get('APROBADA') ?? 0,
      pendientes:
        (countByEstado.get('PENDIENTE') ?? 0) +
        (countByEstado.get('POR_REVISION') ?? 0) +
        (countByEstado.get('ESTIMADA') ?? 0) +
        (countByEstado.get('PLANILLADA') ?? 0),
      conNovedad: countByEstado.get('CON_NOVEDAD') ?? 0,
      rechazadas: countByEstado.get('RECHAZADA_VERIFICACION') ?? 0,
    };
  }

  async createWorkOrdersForContracts(
    rutaId: bigint,
    contratoIds: number[],
  ): Promise<void> {
    if (!contratoIds || contratoIds.length === 0) return;

    const contratos = await this.prisma.contratos.findMany({
      where: {
        contratoId: { in: contratoIds.map((id) => BigInt(id)) },
        deletedAt: null,
      },
      include: {
        historialMedidores: {
          where: { fechaHasta: null },
          select: { medidorId: true },
          take: 1,
        },
      },
      orderBy: { contratoId: 'asc' },
    });

    const ordenesData = contratos.map((c, index) => ({
      rutaId,
      contratoId: c.contratoId,
      medidorId: c.historialMedidores[0]?.medidorId ?? null,
      ordenVisita: index + 1,
      estado: 'PENDIENTE' as const,
    }));

    if (ordenesData.length > 0) {
      await this.prisma.ordenesTrabajo.createMany({
        data: ordenesData,
      });
    }
  }

  async findContratosByIds(contratoIds: number[]): Promise<ContratoRef[]> {
    if (!contratoIds || contratoIds.length === 0) return [];

    const records = await this.prisma.contratos.findMany({
      where: {
        contratoId: { in: contratoIds.map((id) => BigInt(id)) },
        deletedAt: null,
      },
      select: {
        contratoId: true,
        numeroGuia: true,
        comunidadId: true,
        sectorId: true,
      },
      orderBy: { contratoId: 'asc' },
    });

    return records.map((r) => ({
      contratoId: Number(r.contratoId),
      numeroGuia: r.numeroGuia,
      comunidadId: r.comunidadId,
      sectorId: r.sectorId,
    }));
  }

  async findAllTiposActividad(): Promise<TipoActividadRef[]> {
    const tipos = await this.prisma.tipoActividad.findMany({
      where: { activo: true },
      orderBy: { tipoActividadId: 'asc' },
    });

    return tipos.map((t) => ({
      tipoActividadId: Number(t.tipoActividadId),
      codigo: t.codigo,
      nombre: t.nombre,
      descripcion: t.descripcion,
      activo: t.activo,
    }));
  }
}
