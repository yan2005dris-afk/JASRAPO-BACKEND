import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import type { ReportSpec } from '../../interfaces/report-spec.interface';
import type { AccountStatementFilterDto } from '../../dto/account-statement-filter.dto';

type LecturaRow = Prisma.lecturasGetPayload<Record<string, never>>;

@Injectable()
export class AccountStatementReportSpec implements ReportSpec<AccountStatementFilterDto> {
  readonly type = 'account-statement';

  constructor(private readonly prisma: PrismaService) {}

  async fetchData(
    filters: AccountStatementFilterDto,
  ): Promise<Record<string, unknown>> {
    const contratoId = BigInt(filters.contratoId);

    // 1. Contract info (for header — cliente, sector, tarifa, medidor)
    const contrato = await this.prisma.contratos.findFirst({
      where: { contratoId, deletedAt: null },
      include: {
        cliente: true,
        sector: { select: { nombre: true } },
        categoriaTarifa: true,
        historialMedidores: {
          where: { fechaHasta: null },
          take: 1,
          include: { medidor: { select: { serie: true } } },
        },
      },
    });

    if (!contrato) {
      return { contratoId: filters.contratoId, periods: [] };
    }

    // 2. Prefacturas (yearly billing) — up to 6 periods
    const prefacturas = await this.prisma.prefacturas.findMany({
      where: {
        contratoId,
        deletedAt: null,
        estado: { notIn: ['ANULADA'] },
        ...(filters.fechaDesde || filters.fechaHasta
          ? {
              periodoRel: {
                ...(filters.fechaDesde
                  ? { fechaInicio: { gte: new Date(filters.fechaDesde) } }
                  : {}),
                ...(filters.fechaHasta
                  ? { fechaFin: { lte: new Date(filters.fechaHasta) } }
                  : {}),
              },
            }
          : {}),
      },
      include: {
        periodoRel: true,
        prefacturaDetalle: {
          include: { rubro: { select: { nombre: true } } },
        },
      },
      orderBy: { periodoRel: { fechaInicio: 'desc' } },
      take: 6,
    });

    // Reverse to show oldest first
    prefacturas.reverse();

    // 3. Monthly lecturas for each period
    const medidorId = contrato.historialMedidores[0]?.medidorId;
    const periodIds = prefacturas.map((pf) => pf.periodoId);

    let lecturas: LecturaRow[] = [];
    if (medidorId && periodIds.length > 0) {
      lecturas = await this.prisma.lecturas.findMany({
        where: {
          medidorId,
          periodoId: { in: periodIds },
          deletedAt: null,
          estado: 'APROBADA',
        },
        orderBy: [{ periodoId: 'asc' }, { fecha: 'asc' }],
      });
    }

    // Group lecturas by periodoId
    const lecturasByPeriod = new Map<number, LecturaRow[]>();
    for (const l of lecturas) {
      const arr = lecturasByPeriod.get(l.periodoId) ?? [];
      arr.push(l);
      lecturasByPeriod.set(l.periodoId, arr);
    }

    // Build periods array combining prefactura + its monthly lecturas
    const periods = prefacturas.map((pf) => ({
      prefactura: pf,
      lecturas: lecturasByPeriod.get(pf.periodoId) ?? [],
    }));

    return {
      contratoId: filters.contratoId,
      contrato,
      periods,
    };
  }
}
