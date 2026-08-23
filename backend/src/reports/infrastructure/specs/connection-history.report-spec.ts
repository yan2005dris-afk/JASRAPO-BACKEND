import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { ReportSpec } from '../../interfaces/report-spec.interface';
import type { ConnectionHistoryFilterDto } from '../../interfaces/dto/connection-history-filter.dto';
import { normalizeReportDateRange } from './report-date-range';

@Injectable()
export class ConnectionHistoryReportSpec implements ReportSpec<ConnectionHistoryFilterDto> {
  readonly type = 'connection-history';

  constructor(private readonly prisma: PrismaService) {}

  async fetchData(
    filters: ConnectionHistoryFilterDto,
  ): Promise<Record<string, unknown>> {
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      filters.fechaDesde,
      filters.fechaHasta,
    );
    const prefacturas = await this.prisma.prefacturas.findMany({
      where: {
        contratoId: BigInt(filters.contratoId),
        deletedAt: null,
        estado: { not: 'ANULADA' },
        ...(filters.fechaDesde || filters.fechaHasta
          ? {
              periodoRel: {
                ...(startInclusive
                  ? { fechaInicio: { gte: startInclusive } }
                  : {}),
                ...(endExclusive ? { fechaFin: { lt: endExclusive } } : {}),
              },
            }
          : {}),
      },
      include: {
        periodoRel: true,
        contrato: {
          include: {
            cliente: {
              select: { nombres: true, apellidos: true, razonSocial: true },
            },
            historialMedidores: {
              where: { fechaHasta: null },
              take: 1,
              include: { medidor: { select: { serie: true } } },
            },
          },
        },
      },
      orderBy: { periodoRel: { fechaInicio: 'asc' } },
    });

    return {
      contratoId: filters.contratoId,
      prefacturas,
      fechaDesde: filters.fechaDesde ?? null,
      fechaHasta: filters.fechaHasta ?? null,
    };
  }
}
