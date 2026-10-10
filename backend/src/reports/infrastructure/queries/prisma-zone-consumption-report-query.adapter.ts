import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ZoneConsumptionReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  ZoneConsumptionActiveContractReadModel,
  ZoneConsumptionReadingReadModel,
  ZoneConsumptionReportFilters,
  ZoneConsumptionReportReadModel,
} from '../../application/read-models/zone-consumption.read-model';
import type { ReportRequestContext } from '../../application/models/report-request-context';

const SIN_SECTOR_LABEL = 'Sin sector';
const SIN_DATO_LABEL = '—';

interface HistorialContrato {
  fechaDesde: Date;
  fechaHasta: Date | null;
  contrato: {
    sectorId: number | null;
    comunidadId: number;
    sector: { nombre: string } | null;
    comunidad: { nombre: string } | null;
  } | null;
}

@Injectable()
export class PrismaZoneConsumptionReportQueryAdapter extends ZoneConsumptionReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    context: ReportRequestContext<ZoneConsumptionReportFilters>,
  ): Promise<ZoneConsumptionReportReadModel> {
    const { filters } = context;
    const periodo = await this.resolvePeriodo(filters.periodoId);
    if (!periodo) {
      return { periodo: null, readings: [], activeContracts: [] };
    }

    const sectorId = filters.sectorId ? Number(filters.sectorId) : undefined;
    const comunidadId = filters.comunidadId
      ? Number(filters.comunidadId)
      : undefined;

    const [lecturas, contratos] = await Promise.all([
      this.prisma.lecturas.findMany({
        where: { periodoId: periodo.periodoId, deletedAt: null },
        select: {
          medidorId: true,
          consumoCalculado: true,
          estado: true,
          fecha: true,
          medidor: {
            select: {
              historial: {
                select: {
                  fechaDesde: true,
                  fechaHasta: true,
                  contrato: {
                    select: {
                      sectorId: true,
                      comunidadId: true,
                      sector: { select: { nombre: true } },
                      comunidad: { select: { nombre: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.contratos.findMany({
        where: {
          deletedAt: null,
          estadoServicio: 'ACTIVO',
          ...(sectorId !== undefined ? { sectorId } : {}),
          ...(comunidadId !== undefined ? { comunidadId } : {}),
        },
        select: {
          sectorId: true,
          sector: { select: { nombre: true } },
          comunidad: { select: { nombre: true } },
          historialMedidores: {
            where: { fechaHasta: null },
            select: { medidorId: true },
            take: 1,
          },
        },
      }),
    ]);

    const readings: ZoneConsumptionReadingReadModel[] = [];
    for (const lectura of lecturas) {
      const zona = this.resolveZona(
        lectura.medidor?.historial ?? [],
        lectura.fecha,
      );
      // El filtro por sector/comunidad se aplica sobre la zona resuelta (historial
      // vigente a la fecha), para no contar lecturas de un sector que el medidor
      // ya no ocupa.
      if (sectorId !== undefined && zona.sectorId !== sectorId) continue;
      if (comunidadId !== undefined && zona.comunidadId !== comunidadId)
        continue;

      readings.push({
        sectorId: zona.sectorId,
        sectorNombre: zona.sectorNombre,
        comunidadNombre: zona.comunidadNombre,
        medidorId: String(lectura.medidorId),
        consumo: Number(lectura.consumoCalculado ?? 0),
        estado: String(lectura.estado),
      });
    }

    const activeContracts: ZoneConsumptionActiveContractReadModel[] =
      contratos.map((contrato) => ({
        sectorId: contrato.sectorId,
        sectorNombre: contrato.sector?.nombre ?? SIN_SECTOR_LABEL,
        comunidadNombre: contrato.comunidad?.nombre ?? SIN_DATO_LABEL,
        medidorId: contrato.historialMedidores[0]
          ? String(contrato.historialMedidores[0].medidorId)
          : null,
      }));

    return {
      periodo: { id: periodo.periodoId, nombre: periodo.nombre },
      readings,
      activeContracts,
    };
  }

  /**
   * Periodo objetivo: el indicado por `periodoId`, o el más reciente CERRADO
   * (fallback: el más reciente por fecha de fin).
   */
  private async resolvePeriodo(
    periodoId?: string,
  ): Promise<{ periodoId: number; nombre: string } | null> {
    if (periodoId) {
      return this.prisma.periodos.findFirst({
        where: { periodoId: Number(periodoId), deletedAt: null },
        select: { periodoId: true, nombre: true },
      });
    }
    const cerrado = await this.prisma.periodos.findFirst({
      where: { deletedAt: null, estado: 'CERRADO' },
      orderBy: { fechaFin: 'desc' },
      select: { periodoId: true, nombre: true },
    });
    if (cerrado) return cerrado;
    return this.prisma.periodos.findFirst({
      where: { deletedAt: null },
      orderBy: { fechaFin: 'desc' },
      select: { periodoId: true, nombre: true },
    });
  }

  /**
   * Resuelve la zona (sector/comunidad) de una lectura a partir del historial
   * del medidor, tomando la vinculación vigente a la fecha de la lectura.
   */
  private resolveZona(
    historial: HistorialContrato[],
    fecha: Date,
  ): {
    sectorId: number | null;
    sectorNombre: string;
    comunidadId: number | null;
    comunidadNombre: string;
  } {
    const vigente =
      historial.find(
        (row) =>
          row.fechaDesde <= fecha &&
          (row.fechaHasta === null || fecha < row.fechaHasta),
      ) ??
      historial.find((row) => row.fechaHasta === null) ??
      historial[0];

    const contrato = vigente?.contrato ?? null;
    return {
      sectorId: contrato?.sectorId ?? null,
      sectorNombre: contrato?.sector?.nombre ?? SIN_SECTOR_LABEL,
      comunidadId: contrato?.comunidadId ?? null,
      comunidadNombre: contrato?.comunidad?.nombre ?? SIN_DATO_LABEL,
    };
  }
}
