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
  OperatorRoute,
  ReadingWithAnomalies,
  RouteStateUpdate,
  OperatorUser,
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
      where.tipoRuta = tipoRuta as Prisma.RutasWhereInput['tipoRuta'];
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
        throw new InvalidDomainOperationException(
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
          tipoActividad: order.tipoActividad,
          estado: order.estado,
          direccionSuministro: order.contrato.direccionSuministro,
        },
      ];
    });

    return {
      ...route,
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
