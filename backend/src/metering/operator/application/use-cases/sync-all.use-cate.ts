import { Injectable, NotFoundException } from '@nestjs/common';
import { MeterEntity } from 'src/metering/meters/domain/entities/meter.entity';
import { EstadoMedidor, EstadoPeriodo, EstadoRuta } from 'src/shared/enums';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class SyncAllUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(operarioId: number): Promise<MeterEntity[]> {
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
        comunidadId: true,
        sectorId: true,
      },
    });

    // 3. No routes → return empty
    if (rutas.length === 0) {
      return [];
    }

    // 4. Build OR conditions for each ruta's comunidad/sector combination
    const rutaConditions = rutas.map((ruta) => ({
      comunidadId: ruta.comunidadId,
      ...(ruta.sectorId !== null && ruta.sectorId !== undefined
        ? { sectorId: ruta.sectorId }
        : {}),
    }));

    // 5. Query meters with active historial matching the operator's routes
    const meters = await this.prisma.medidores.findMany({
      where: {
        estado: EstadoMedidor.INSTALADO,
        deletedAt: null,
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              OR: rutaConditions,
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
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    // 6. Map to MeterEntity[]
    return (meters as any[]).map((m: any) => {
      const activeHistorial = m.historial?.[0];
      return new MeterEntity({
        medidorId: m.medidorId,
        marca: m.marca,
        modelo: m.modelo,
        serie: m.serie,
        estado: m.estado as EstadoMedidor,
        fechaInstalacion: m.fechaInstalacion,
        fechaBaja: m.fechaBaja,
        motivo: m.motivo,
        latitud: m.latitud ? Number(m.latitud) : null,
        longitud: m.longitud ? Number(m.longitud) : null,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        deletedAt: m.deletedAt,
        contratoId: activeHistorial?.contrato?.contratoId ?? null,
        clienteNombre: activeHistorial?.contrato?.cliente?.nombres ?? null,
      });
    });
  }
}
