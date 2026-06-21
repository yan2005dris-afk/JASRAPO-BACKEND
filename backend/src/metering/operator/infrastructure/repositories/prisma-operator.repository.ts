import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoPeriodo, EstadoRuta, EstadoMedidor } from 'src/shared/enums';
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

}
