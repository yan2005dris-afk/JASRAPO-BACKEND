import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EstadoPeriodo,
  EstadoRuta,
  EstadoMedidor,
  EstadoLectura,
  EstadoAnomalia,
} from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import {
  OperatorRepository,
  type ActivePeriod,
  type RouteData,
  type ReadingWithDetails,
} from '../../domain/repositories/operator.repository';
import type {
  ReadingWithContractDetail,
  MeterWithContractDetail,
  OperatorTask,
  ReadingWithAnomalies,
  TaskStateUpdate,
  OperatorUser,
  TaskRoutePoint,
} from '../../domain/repositories/repository-types';

const taskOperarioSelect = {
  usuarioId: true,
  nombres: true,
  apellidos: true,
} satisfies Prisma.UsuariosSelect;

const taskInclude = {
  operario: { select: taskOperarioSelect },
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
    const result = await this.prisma.lecturas.findMany({
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
        fotoUrl: true,
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
                    estado: true,
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
      },
    });
    return result as unknown as ReadingWithContractDetail[];
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
    return this.prisma.lecturas.findUnique({
      where: { lecturaId: id, deletedAt: null },
      select: {
        lecturaId: true,
        estado: true,
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
  }

  // ── Task methods (operator-tareas) ──────────────────────────────

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

  async findTasksByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<OperatorTask[]> {
    const where: Prisma.RutasWhereInput = {
      operarioId,
      periodoId,
      deletedAt: null,
    };

    if (tipoRuta != null) {
      where.tipoRuta = tipoRuta as Prisma.RutasWhereInput['tipoRuta'];
    }

    const tasks = await this.prisma.rutas.findMany({
      where,
      orderBy: [{ comunidadId: 'asc' }, { sectorId: 'asc' }, { orden: 'asc' }],
      include: taskInclude,
    });

    const readingTasks = tasks.filter(
      (t) => t.tipoRuta === 'TOMA_LECTURA',
    ) as unknown as OperatorTask[];

    if (readingTasks.length === 0) {
      return tasks as unknown as OperatorTask[];
    }

    const meters = await this.findMetersByRoutes(
      readingTasks.map((t) => ({
        rutaId: t.rutaId,
        comunidadId: t.comunidadId,
        sectorId: t.sectorId,
      })),
    );

    const pointsByTask = new Map<bigint, TaskRoutePoint[]>();

    for (const task of readingTasks) {
      const matchingMeters = meters.filter((m) => {
        const contrato = m.historial?.[0]?.contrato;
        if (!contrato) return false;
        const sameSector =
          task.sectorId === null || task.sectorId === undefined
            ? true
            : contrato.sectorId === task.sectorId;
        return contrato.comunidadId === task.comunidadId && sameSector;
      });

      matchingMeters.sort((a, b) => a.serie.localeCompare(b.serie));

      pointsByTask.set(
        task.rutaId,
        matchingMeters
          .map((m) => ({
            latitud: m.latitud != null ? Number(m.latitud) : null,
            longitud: m.longitud != null ? Number(m.longitud) : null,
            serie: m.serie,
            clienteNombre: m.historial?.[0]?.contrato?.cliente
              ? `${m.historial[0].contrato.cliente.nombres} ${m.historial[0].contrato.cliente.apellidos}`.trim()
              : '',
          }))
          .filter(
            (pt): pt is TaskRoutePoint =>
              pt.latitud != null && pt.longitud != null,
          ),
      );
    }

    return tasks.map((t) => ({
      ...t,
      rutaPuntos: pointsByTask.get(t.rutaId),
    })) as unknown as OperatorTask[];
  }

  async updateTaskState(
    rutaId: bigint,
    data: TaskStateUpdate,
    expectedEstado?: string,
  ): Promise<OperatorTask> {
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
      return (await this.prisma.rutas.update({
        where,
        data: updateData,
        include: taskInclude,
      })) as unknown as OperatorTask;
    } catch (error) {
      if (this.isOptimisticLockFailure(error)) {
        throw new InvalidDomainOperationException(
          'Conflicto de concurrencia: la tarea fue modificada por otro operario',
        );
      }
      throw error;
    }
  }

  async completeInstallationTask(
    rutaId: bigint,
    taskUpdateData: TaskStateUpdate,
    expectedEstado: string,
    meterUpdateData: {
      medidorId: bigint;
      estado: string;
      fechaInstalacion: Date;
    },
  ): Promise<OperatorTask> {
    try {
      return (await this.prisma.$transaction(async (tx) => {
        const taskUpdate: Prisma.RutasUpdateInput = {};
        if (taskUpdateData.estado !== undefined)
          taskUpdate.estado = taskUpdateData.estado as EstadoRuta;
        if (taskUpdateData.fechaFin !== undefined)
          taskUpdate.fechaFin = taskUpdateData.fechaFin;
        if (taskUpdateData.observacion !== undefined)
          taskUpdate.observacion = taskUpdateData.observacion;

        const updated = await tx.rutas.update({
          where: {
            rutaId,
            deletedAt: null,
            estado: expectedEstado as EstadoRuta,
          },
          data: taskUpdate,
          include: taskInclude,
        });

        await tx.medidores.update({
          where: { medidorId: meterUpdateData.medidorId },
          data: {
            estado: meterUpdateData.estado as EstadoMedidor,
            fechaInstalacion: meterUpdateData.fechaInstalacion,
          },
        });

        return updated;
      })) as unknown as OperatorTask;
    } catch (error) {
      if (this.isOptimisticLockFailure(error)) {
        throw new InvalidDomainOperationException(
          'Conflicto de concurrencia: la tarea fue modificada por otro operario',
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
        lecturaAnomalias: {
          some: { estado: EstadoAnomalia.PENDIENTE, deletedAt: null },
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
        lecturaAnomalias: {
          where: { estado: EstadoAnomalia.PENDIENTE, deletedAt: null },
          select: {
            anomaliaId: true,
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
