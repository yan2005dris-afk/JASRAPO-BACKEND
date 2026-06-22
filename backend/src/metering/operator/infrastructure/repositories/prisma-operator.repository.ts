import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  EstadoPeriodo,
  EstadoRuta,
  EstadoMedidor,
  EstadoLectura,
  EstadoAnomalia,
} from 'src/shared/enums';
import {
  OperatorRepository,
  type ActivePeriod,
  type RouteData,
  type ReadingWithDetails,
} from '../../domain/repositories/operator.repository';

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
    routeConditions: Record<string, unknown>[],
  ): Promise<any[]> {
    return this.prisma.lecturas.findMany({
      where: {
        periodoId,
        deletedAt: null,
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
  }

  async findMetersByRoutes(
    routeConditions: Record<string, unknown>[],
  ): Promise<any[]> {
    return this.prisma.medidores.findMany({
      where: {
        estado: EstadoMedidor.INSTALADO,
        deletedAt: null,
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              OR: routeConditions,
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

  async findTasksByOperator(
    operarioId: number,
    periodoId: number,
    tipoRuta?: string,
  ): Promise<any[]> {
    const where: Record<string, any> = {
      operarioId,
      periodoId,
      deletedAt: null,
    };

    if (tipoRuta != null) {
      where.tipoRuta = tipoRuta;
    }

    return this.prisma.rutas.findMany({
      where,
      orderBy: [{ comunidadId: 'asc' }, { sectorId: 'asc' }, { orden: 'asc' }],
    });
  }

  async updateTaskState(
    rutaId: bigint,
    data: Record<string, any>,
  ): Promise<any> {
    const updateData: Record<string, any> = {};

    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.fechaInicio !== undefined)
      updateData.fechaInicio = data.fechaInicio;
    if (data.fechaFin !== undefined) updateData.fechaFin = data.fechaFin;
    if (data.observacion !== undefined)
      updateData.observacion = data.observacion;

    return this.prisma.rutas.update({
      where: { rutaId, deletedAt: null },
      data: updateData,
    });
  }

  async findOperatorsByGeography(
    comunidadId: number,
    sectorId: number | null,
  ): Promise<any[]> {
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

  async findMedidoresById(medidorIds: bigint[]): Promise<any[]> {
    return this.prisma.medidores.findMany({
      where: { medidorId: { in: medidorIds } },
      select: {
        medidorId: true,
        serie: true,
        marca: true,
        modelo: true,
        latitud: true,
        longitud: true,
      },
    });
  }

  async findReadingsWithPendingAnomalies(
    operarioId: number,
    periodoId: number,
  ): Promise<any[]> {
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

    return this.prisma.lecturas.findMany({
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
  }
}
