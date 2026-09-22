import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EstadoPeriodo,
  EstadoRuta,
  EstadoMedidor,
  EstadoLectura,
  EstadoNovedad,
} from 'src/shared/enums';
import {
  ConflictDomainException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  OperatorRepository,
  type ActivePeriod,
  type RouteData,
  type ReadingWithDetails,
} from '../../domain/repositories/operator.repository';
import type {
  ReadingWithContractDetail,
  MeterWithContractDetail,
  OperatorRoute,
  OperatorWorkOrder,
  ReadingWithAnomalies,
  RouteStateUpdate,
  OperatorUser,
  SyncCursorPosition,
  SyncSnapshotContext,
  SyncPage,
  SyncChangePage,
} from '../../domain/repositories/repository-types';

const routeOperarioSelect = {
  usuarioId: true,
  nombres: true,
  apellidos: true,
} satisfies Prisma.UsuariosSelect;

const routeMedidorSelect = {
  medidorId: true,
  serie: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

const operatorRouteInclude = {
  tipoActividad: { select: { codigo: true } },
  operario: { select: routeOperarioSelect },
  ordenesTrabajo: {
    where: { deletedAt: null },
    orderBy: [{ ordenVisita: 'asc' }, { ordenTrabajoId: 'asc' }],
    include: {
      contrato: {
        select: {
          numeroGuia: true,
          direccionSuministro: true,
          cliente: {
            select: {
              nombres: true,
              apellidos: true,
              razonSocial: true,
            },
          },
        },
      },
      medidor: { select: routeMedidorSelect },
      ruta: { select: { tipoActividad: { select: { codigo: true } } } },
    },
  },
} satisfies Prisma.RutasInclude;

@Injectable()
export class PrismaOperatorRepository extends OperatorRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActivePeriod(): Promise<ActivePeriod | null> {
    return this.prisma.periodos.findFirst({
      where: { estado: EstadoPeriodo.ABIERTO },
      select: { periodoId: true },
    });
  }

  async verifyMeterOwnership(
    operarioId: number,
    medidorId: bigint,
  ): Promise<void> {
    const activePeriod = await this.findActivePeriod();
    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    const route = await this.prisma.rutas.findFirst({
      where: {
        operarioId,
        periodoId: activePeriod.periodoId,
        estado: {
          notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
        },
        deletedAt: null,
        ordenesTrabajo: {
          some: {
            medidorId,
            deletedAt: null,
          },
        },
      },
      select: { rutaId: true },
    });

    if (!route) {
      throw new InvalidDomainOperationException(
        'El medidor no pertenece a tu ruta asignada',
      );
    }
  }

  async findActiveRoutes(
    operarioId: number,
    periodoId: number,
  ): Promise<RouteData[]> {
    return this.prisma.rutas.findMany({
      where: {
        operarioId,
        periodoId,
        estado: {
          notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
        },
        deletedAt: null,
      },
      select: {
        rutaId: true,
        comunidadId: true,
        sectorId: true,
      },
    });
  }

  async findReadingsByPeriodAndRoutes(
    periodoId: number,
    routes: RouteData[],
  ): Promise<ReadingWithContractDetail[]> {
    const result: any = await this.prisma.lecturas.findMany({
      where: {
        periodoId,
        deletedAt: null,
        medidor: {
          historial: {
            some: {
              fechaHasta: null,
              OR: this.toReadingRouteConditions(routes),
            },
          },
        },
      },
      select: {
        lecturaId: true,
        fecha: true,
        lecturaAnterior: true,
        lecturaActual: true,
        consumoCalculado: true,
        descripcionAnomalia: true,
        fechaValidacion: true,
        lecturaInicial: true,
        periodoId: true,
        estado: true,
        medidor: {
          select: {
            medidorId: true,
            serie: true,
            marca: true,
            modelo: true,
            historial: {
              where: { fechaHasta: null },
              select: {
                contrato: {
                  select: {
                    contratoId: true,
                    numeroGuia: true,
                    direccionSuministro: true,
                    estadoServicio: true,
                    comunidadId: true,
                    sectorId: true,
                    cliente: {
                      select: {
                        nombres: true,
                        apellidos: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        periodoRel: {
          select: {
            periodoId: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
        ordenesTrabajo: {
          where: { deletedAt: null },
          select: { evidenciaFotoUrl: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    return result.map((reading) => ({
      ...reading,
      evidenciaFotoUrl:
        reading.ordenesTrabajo?.find((order) => order.evidenciaFotoUrl)
          ?.evidenciaFotoUrl ?? null,
    }));
  }

  async findMetersByRoutes(
    routes: RouteData[],
  ): Promise<MeterWithContractDetail[]> {
    const result = await this.prisma.medidores.findMany({
      where: {
        estado: EstadoMedidor.INSTALADO,
        deletedAt: null,
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              OR: this.toMeterRouteConditions(routes),
            },
          },
        },
      },
      select: {
        medidorId: true,
        marca: true,
        modelo: true,
        serie: true,
        estado: true,
        fechaInstalacion: true,
        fechaBaja: true,
        motivo: true,
        latitud: true,
        longitud: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        historial: {
          where: { fechaHasta: null },
          select: {
            contrato: {
              select: {
                contratoId: true,
                comunidadId: true,
                sectorId: true,
                direccionSuministro: true,
                cliente: {
                  select: {
                    nombres: true,
                    apellidos: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });
    return result as unknown as MeterWithContractDetail[];
  }

  async findReadingWithDetails(id: bigint): Promise<ReadingWithDetails | null> {
    const result = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id, deletedAt: null },
      select: {
        lecturaId: true,
        estado: true,
        ordenesTrabajo: {
          where: { deletedAt: null },
          select: {
            rutaId: true,
            evidenciaFotoUrl: true,
            ruta: {
              select: {
                operarioId: true,
                periodoId: true,
              },
            },
          },
        },
        medidor: {
          select: {
            historial: {
              where: { fechaHasta: null },
              select: {
                contrato: {
                  select: {
                    contratoId: true,
                    comunidadId: true,
                    sectorId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result;
  }

  /** Translate RouteData[] into Prisma OR conditions scoped by contract. */
  private toReadingRouteConditions(
    routes: RouteData[],
  ): Prisma.HistorialMedidoresWhereInput[] {
    return routes.map((r) => ({
      contrato: {
        comunidadId: r.comunidadId,
        ...(r.sectorId !== null && r.sectorId !== undefined
          ? { sectorId: r.sectorId }
          : {}),
      },
    }));
  }

  /** Translate RouteData[] into flat community/sector conditions for meters. */
  private toMeterRouteConditions(routes: RouteData[]): Array<{
    comunidadId: number;
    sectorId?: number;
  }> {
    return routes.map((r) => ({
      comunidadId: r.comunidadId,
      ...(r.sectorId !== null && r.sectorId !== undefined
        ? { sectorId: r.sectorId }
        : {}),
    }));
  }

  async findSyncRoutes(
    operarioId: number,
    periodoId: number,
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<OperatorRoute>> {
    const where: any = {
      operarioId,
      periodoId,
      estado: {
        notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
      },
      deletedAt: null,
      updatedAt: { lte: snapshotVersion },
      ...(after ? this.keyset(after, 'rutaId') : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.rutas.findMany({
        where,
        orderBy: [{ updatedAt: 'asc' }, { rutaId: 'asc' }],
        take: limit + 1,
        include: {
          operario: { select: routeOperarioSelect },
          tipoActividad: { select: { codigo: true } },
          ordenesTrabajo: false,
        },
      }),
      this.prisma.rutas.count({ where }),
    ]);
    const pageItems = items.slice(0, limit).map((route: any) => ({
      ...route,
      tipoRuta: route.tipoActividad.codigo,
      ordenesTrabajo: [],
      paradas: [],
    })) as OperatorRoute[];
    return this.page(pageItems, total, items.length > limit, 'rutaId');
  }

  async findSyncWorkOrders(
    operarioId: number,
    periodoId: number,
    routeIds: bigint[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<OperatorWorkOrder>> {
    const where: any = {
      rutaId: { in: routeIds },
      deletedAt: null,
      updatedAt: { lte: snapshotVersion },
      ruta: {
        operarioId,
        periodoId,
        estado: {
          notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
        },
        deletedAt: null,
      },
      ...(after ? this.keyset(after, 'ordenTrabajoId') : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.ordenesTrabajo.findMany({
        where,
        orderBy: [{ updatedAt: 'asc' }, { ordenTrabajoId: 'asc' }],
        take: limit + 1,
        include: {
          contrato: {
            select: {
              numeroGuia: true,
              direccionSuministro: true,
              cliente: {
                select: { nombres: true, apellidos: true, razonSocial: true },
              },
            },
          },
          medidor: { select: routeMedidorSelect },
          ruta: { select: { tipoActividad: { select: { codigo: true } } } },
        },
      }),
      this.prisma.ordenesTrabajo.count({ where }),
    ]);
    return this.page(
      items.slice(0, limit).map((item) => ({
        ...item,
        tipoActividad: item.ruta.tipoActividad.codigo,
      })) as OperatorWorkOrder[],
      total,
      items.length > limit,
      'ordenTrabajoId',
    );
  }

  async findSyncMeters(
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<MeterWithContractDetail>> {
    const where: any = {
      estado: EstadoMedidor.INSTALADO,
      deletedAt: null,
      updatedAt: { lte: snapshotVersion },
      historial: {
        some: {
          fechaHasta: null,
          contrato: { OR: this.toMeterRouteConditions(routes) },
        },
      },
      ...(after ? this.keyset(after, 'medidorId') : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.medidores.findMany({
        where,
        orderBy: [{ updatedAt: 'asc' }, { medidorId: 'asc' }],
        take: limit + 1,
        select: {
          medidorId: true,
          marca: true,
          modelo: true,
          serie: true,
          estado: true,
          fechaInstalacion: true,
          fechaBaja: true,
          motivo: true,
          latitud: true,
          longitud: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          historial: {
            where: { fechaHasta: null },
            take: 1,
            select: {
              contrato: {
                select: {
                  contratoId: true,
                  comunidadId: true,
                  sectorId: true,
                  direccionSuministro: true,
                  cliente: { select: { nombres: true, apellidos: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.medidores.count({ where }),
    ]);
    return this.page(
      items.slice(0, limit) as MeterWithContractDetail[],
      total,
      items.length > limit,
      'medidorId',
    );
  }

  async findSyncReadings(
    periodoId: number,
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<ReadingWithContractDetail>> {
    const where: any = {
      periodoId,
      deletedAt: null,
      updatedAt: { lte: snapshotVersion },
      medidor: {
        historial: {
          some: { fechaHasta: null, OR: this.toReadingRouteConditions(routes) },
        },
      },
      ...(after ? this.keyset(after, 'lecturaId') : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.lecturas.findMany({
        where,
        orderBy: [{ updatedAt: 'asc' }, { lecturaId: 'asc' }],
        take: limit + 1,
        select: {
          lecturaId: true,
          fecha: true,
          lecturaAnterior: true,
          lecturaActual: true,
          consumoCalculado: true,
          descripcionAnomalia: true,
          fechaValidacion: true,
          lecturaInicial: true,
          periodoId: true,
          estado: true,
          updatedAt: true,
          medidor: {
            select: {
              medidorId: true,
              serie: true,
              marca: true,
              modelo: true,
              historial: {
                where: { fechaHasta: null },
                select: {
                  contrato: {
                    select: {
                      contratoId: true,
                      numeroGuia: true,
                      direccionSuministro: true,
                      estadoServicio: true,
                      comunidadId: true,
                      sectorId: true,
                      cliente: { select: { nombres: true, apellidos: true } },
                    },
                  },
                },
              },
            },
          },
          periodoRel: {
            select: {
              periodoId: true,
              nombre: true,
              fechaInicio: true,
              fechaFin: true,
            },
          },
          ordenesTrabajo: {
            where: { deletedAt: null },
            select: { evidenciaFotoUrl: true },
            orderBy: { updatedAt: 'desc' },
          },
        },
      }),
      this.prisma.lecturas.count({ where }),
    ]);
    const mapped = items.slice(0, limit).map((reading: any) => ({
      ...reading,
      evidenciaFotoUrl:
        reading.ordenesTrabajo?.find((o: any) => o.evidenciaFotoUrl)
          ?.evidenciaFotoUrl ?? null,
    }));
    return this.page(
      mapped as ReadingWithContractDetail[],
      total,
      items.length > limit,
      'lecturaId',
    );
  }

  async findSyncPendingAnomalies(
    operarioId: number,
    periodoId: number,
    routes: RouteData[],
    snapshotVersion: Date,
    after: SyncCursorPosition | null,
    limit: number,
  ): Promise<SyncPage<ReadingWithAnomalies>> {
    const where: any = {
      periodoId,
      deletedAt: null,
      updatedAt: { lte: snapshotVersion },
      estado: EstadoLectura.CON_NOVEDAD,
      novedadesOrdenTrabajo: {
        some: { estado: EstadoNovedad.OPEN, deletedAt: null },
      },
      medidor: {
        historial: {
          some: { fechaHasta: null, OR: this.toReadingRouteConditions(routes) },
        },
      },
      ...(after ? this.keyset(after, 'lecturaId') : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.lecturas.findMany({
        where,
        orderBy: [{ updatedAt: 'asc' }, { lecturaId: 'asc' }],
        take: limit + 1,
        select: {
          lecturaId: true,
          updatedAt: true,
          fecha: true,
          lecturaAnterior: true,
          lecturaActual: true,
          consumoCalculado: true,
          estado: true,
          periodoId: true,
          descripcionAnomalia: true,
          medidor: {
            select: { medidorId: true, serie: true, marca: true, modelo: true },
          },
          novedadesOrdenTrabajo: {
            where: { estado: EstadoNovedad.OPEN, deletedAt: null },
            select: {
              novedadId: true,
              tipo: true,
              estado: true,
              observacion: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.lecturas.count({ where }),
    ]);
    return this.page(
      items.slice(0, limit) as unknown as ReadingWithAnomalies[],
      total,
      items.length > limit,
      'lecturaId',
    );
  }

  async getSyncWatermark(): Promise<bigint> {
    const latest = await this.prisma.operatorSyncChange.findFirst({
      orderBy: { sequenceId: 'desc' },
      select: { sequenceId: true },
    });
    return latest?.sequenceId ?? 0n;
  }

  async getSyncSnapshotContext(): Promise<SyncSnapshotContext> {
    const result = await this.prisma.$queryRaw<
      Array<{ snapshot_version: Date; watermark: bigint }>
    >`
      SELECT
        CURRENT_TIMESTAMP(3) AS snapshot_version,
        COALESCE(MAX(sequence_id), 0)::bigint AS watermark
      FROM operator_sync_changes;
    `;
    const row = result[0];
    return {
      snapshotVersion: row?.snapshot_version ?? new Date(),
      watermark: row?.watermark != null ? BigInt(row.watermark) : 0n,
    };
  }

  async findSyncChanges(
    periodoId: number,
    routes: RouteData[],
    afterSequence: bigint,
    limit: number,
  ): Promise<SyncChangePage> {
    const scope = routes.flatMap((route) => {
      const geography =
        route.sectorId == null
          ? { comunidadId: route.comunidadId }
          : { comunidadId: route.comunidadId, sectorId: route.sectorId };
      return [
        ...(route.rutaId === undefined
          ? []
          : [
              {
                rutaId: route.rutaId,
                entityType: { in: ['rutas', 'ordenes_trabajo'] },
              },
            ]),
        {
          ...geography,
          periodoId,
          entityType: { in: ['lecturas'] },
        },
        { ...geography, entityType: { in: ['medidores'] } },
      ];
    });
    if (!scope.length) return { items: [], hasMore: false, nextSequence: null };
    const rows = await this.prisma.operatorSyncChange.findMany({
      where: {
        sequenceId: { gt: afterSequence },
        OR: scope,
        entityType: {
          in: ['rutas', 'ordenes_trabajo', 'lecturas', 'medidores'],
        },
      },
      orderBy: { sequenceId: 'asc' },
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row: any) => {
      const payload = row.payload as { data?: unknown };
      const data = payload?.data;
      return {
        sequenceId: row.sequenceId,
        entityType: row.entityType,
        entityId: row.entityId,
        operation: row.operation,
        changedAt: row.changedAt,
        data: (data && typeof data === 'object' && !Array.isArray(data)
          ? data
          : {}) as Record<string, unknown>,
      };
    });
    return {
      items,
      hasMore,
      nextSequence: hasMore ? (items.at(-1)?.sequenceId ?? null) : null,
    };
  }

  private keyset(after: SyncCursorPosition, id: string): any {
    return {
      OR: [
        { updatedAt: { gt: after.updatedAt } },
        { updatedAt: after.updatedAt, [id]: { gt: after.id } },
      ],
    };
  }

  private page<T>(
    items: T[],
    total: number,
    hasMore: boolean,
    id: string,
  ): SyncPage<T> {
    const last: any = items.at(-1);
    return {
      items,
      total,
      hasMore,
      nextPosition:
        hasMore && last ? { updatedAt: last.updatedAt, id: last[id] } : null,
    };
  }

  async findRoutesByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<OperatorRoute[]> {
    const where: Prisma.RutasWhereInput = {
      operarioId,
      periodoId,
      deletedAt: null,
    };

    if (tipoRuta != null) {
      where.tipoActividad = { codigo: tipoRuta };
    }

    const routes = await this.prisma.rutas.findMany({
      where,
      orderBy: [{ comunidadId: 'asc' }, { sectorId: 'asc' }, { orden: 'asc' }],
      include: operatorRouteInclude,
    });

    return routes.map((route) => this.toOperatorRoute(route));
  }

  async updateRouteState(
    rutaId: bigint,
    data: RouteStateUpdate,
    expectedEstado?: string,
  ): Promise<OperatorRoute> {
    const updateData: Prisma.RutasUpdateInput = {};

    if (data.estado !== undefined)
      updateData.estado = data.estado as EstadoRuta;
    if (data.fechaInicio !== undefined)
      updateData.fechaInicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fechaFin = data.fechaFin;
    if (data.observacion !== undefined)
      updateData.observacion = data.observacion;

    const where: Prisma.RutasWhereUniqueInput = {
      rutaId,
      deletedAt: null,
      ...(expectedEstado !== undefined
        ? { estado: expectedEstado as EstadoRuta }
        : {}),
    };

    try {
      const route = await this.prisma.rutas.update({
        where,
        data: updateData,
        include: operatorRouteInclude,
      });
      return this.toOperatorRoute(route);
    } catch (error) {
      if (this.isOptimisticLockFailure(error)) {
        throw new ConflictDomainException(
          'Conflicto de concurrencia: la ruta fue modificada por otro operario',
        );
      }
      throw error;
    }
  }

  /** Detects Prisma P2025 (record not found) from an optimistic-lock update. */
  private isOptimisticLockFailure(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  private toOperatorRoute(
    route: Prisma.RutasGetPayload<{ include: typeof operatorRouteInclude }>,
  ): OperatorRoute {
    const ordenesTrabajo = route.ordenesTrabajo.map((order) => ({
      ...order,
      medidor: order.medidor
        ? {
            ...order.medidor,
            latitud:
              order.medidor.latitud == null
                ? null
                : Number(order.medidor.latitud),
            longitud:
              order.medidor.longitud == null
                ? null
                : Number(order.medidor.longitud),
          }
        : null,
    }));

    const paradas = ordenesTrabajo.flatMap((order) => {
      if (order.medidor?.latitud == null || order.medidor.longitud == null) {
        return [];
      }

      const customer = order.contrato.cliente;
      const clienteNombre =
        customer.razonSocial?.trim() ||
        `${customer.nombres} ${customer.apellidos}`.trim();

      return [
        {
          ordenTrabajoId: order.ordenTrabajoId,
          latitud: order.medidor.latitud,
          longitud: order.medidor.longitud,
          serie: order.medidor.serie,
          clienteNombre,
          tipoActividad: route.tipoActividad.codigo,
          estado: order.estado,
          direccionSuministro: order.contrato.direccionSuministro,
        },
      ];
    });

    return {
      ...route,
      tipoRuta: route.tipoActividad.codigo,
      ordenesTrabajo,
      paradas,
    } as unknown as OperatorRoute;
  }

  async findOperatorsByGeography(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<OperatorUser[]> {
    const where: any = {
      rutas: {
        some: {
          comunidadId,
          deletedAt: null,
        },
      },
    };

    if (sectorId !== null && sectorId !== undefined) {
      where.rutas.some.sectorId = sectorId;
    }

    return this.prisma.usuarios.findMany({ where });
  }

  async getMaxOrdenInZona(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<number> {
    const where: any = { comunidadId, deletedAt: null };

    if (sectorId !== null && sectorId !== undefined) {
      where.sectorId = sectorId;
    }

    const result = await this.prisma.rutas.aggregate({
      where,
      _max: { orden: true },
    });

    return result._max.orden ?? 0;
  }

  async findMeterContractLocation(medidorId: bigint): Promise<{
    serie: string;
    comunidadId: number;
    sectorId: number | null;
  } | null> {
    const result = await this.prisma.medidores.findUnique({
      where: { medidorId },
      select: {
        serie: true,
        historial: {
          where: { fechaHasta: null },
          take: 1,
          select: {
            contrato: {
              select: { comunidadId: true, sectorId: true },
            },
          },
        },
      },
    });

    if (!result) return null;

    const contrato = result.historial?.[0]?.contrato;
    if (!contrato) return null;

    return {
      serie: result.serie,
      comunidadId: contrato.comunidadId,
      sectorId: contrato.sectorId,
    };
  }

  async findReadingsWithPendingAnomalies(
    operarioId: number,
    periodoId: number,
  ): Promise<ReadingWithAnomalies[]> {
    const routes = await this.findActiveRoutes(operarioId, periodoId);

    if (routes.length === 0) {
      return [];
    }

    const routeConditions = routes.map((r) => ({
      contrato: {
        comunidadId: r.comunidadId,
        ...(r.sectorId !== null && r.sectorId !== undefined
          ? { sectorId: r.sectorId }
          : {}),
      },
    }));

    const result = await this.prisma.lecturas.findMany({
      where: {
        periodoId,
        deletedAt: null,
        estado: EstadoLectura.CON_NOVEDAD,
        novedadesOrdenTrabajo: {
          some: { estado: EstadoNovedad.OPEN, deletedAt: null },
        },
        medidor: {
          historial: {
            some: {
              fechaHasta: null,
              OR: routeConditions,
            },
          },
        },
      },
      select: {
        lecturaId: true,
        fecha: true,
        lecturaAnterior: true,
        lecturaActual: true,
        consumoCalculado: true,
        estado: true,
        periodoId: true,
        descripcionAnomalia: true,
        medidor: {
          select: {
            medidorId: true,
            serie: true,
            marca: true,
            modelo: true,
          },
        },
        novedadesOrdenTrabajo: {
          where: { estado: EstadoNovedad.OPEN, deletedAt: null },
          select: {
            novedadId: true,
            tipo: true,
            estado: true,
            observacion: true,
            createdAt: true,
          },
        },
      },
    });
    return result as unknown as ReadingWithAnomalies[];
  }
}
