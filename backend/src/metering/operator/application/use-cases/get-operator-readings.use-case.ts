import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoPeriodo, EstadoRuta } from 'src/shared/enums';
import type { IResponseReading } from 'src/metering/readings/types/IResponseReading';

@Injectable()
export class GetOperatorReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(operarioId: number): Promise<IResponseReading[]> {
    // 1. Find the active billing period
    const activePeriod = await this.prisma.periodos.findFirst({
      where: { estado: EstadoPeriodo.ABIERTO },
      select: { periodoId: true },
    });

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    // 2. Find operator's active rutas for this period
    const rutas = await this.prisma.rutas.findMany({
      where: {
        operarioId,
        periodoId: activePeriod.periodoId,
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

    // 3. No routes assigned → return empty list (not 404)
    if (rutas.length === 0) {
      return [];
    }

    // 4. Build OR conditions for each ruta's comunidad/sector combination
    const rutaConditions = rutas.map((ruta) => ({
      contrato: {
        comunidadId: ruta.comunidadId,
        ...(ruta.sectorId !== null && ruta.sectorId !== undefined
          ? { sectorId: ruta.sectorId }
          : {}),
      },
    }));

    // 5. Query lecturas that belong to any of the operator's rutas
    const lecturas = await this.prisma.lecturas.findMany({
      where: {
        periodoId: activePeriod.periodoId,
        deletedAt: null,
        medidor: {
          historial: {
            some: {
              fechaHasta: null,
              OR: rutaConditions,
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

    // 6. Map raw Prisma results to IResponseReading
    return lecturas.map((lectura) => {
      const activeHistorial = lectura.medidor?.historial?.[0];
      const contrato = activeHistorial?.contrato ?? null;

      return {
        lecturaId: lectura.lecturaId.toString(),
        fecha: lectura.fecha,
        lecturaAnterior: Number(lectura.lecturaAnterior),
        lecturaActual: Number(lectura.lecturaActual),
        consumoCalculado: Number(lectura.consumoCalculado),
        contratoId: contrato ? contrato.contratoId.toString() : '',
        descripcionAnomalia: lectura.descripcionAnomalia,
        fechaValidacion: lectura.fechaValidacion,
        fotoUrl: lectura.fotoUrl,
        // Computed fields — not stored in DB
        isValidada: lectura.estado !== 'PENDIENTE',
        tieneAnomalia: !!lectura.descripcionAnomalia,
        lecturaInicial: lectura.lecturaInicial,
        periodoId: lectura.periodoId,
        estado: lectura.estado,
        contrato: contrato
          ? {
              contratoId: contrato.contratoId.toString(),
              numeroGuia: contrato.numeroGuia,
              direccionSuministro: contrato.direccionSuministro,
              estado: contrato.estado,
            }
          : null,
        medidor: lectura.medidor
          ? {
              medidorId: lectura.medidor.medidorId.toString(),
              serie: lectura.medidor.serie,
              marca: lectura.medidor.marca,
              modelo: lectura.medidor.modelo,
            }
          : null,
        periodoRel: lectura.periodoRel
          ? {
              periodoId: lectura.periodoRel.periodoId,
              nombre: lectura.periodoRel.nombre,
              fechaInicio: lectura.periodoRel.fechaInicio,
              fechaFin: lectura.periodoRel.fechaFin,
            }
          : null,
      };
    });
  }
}
