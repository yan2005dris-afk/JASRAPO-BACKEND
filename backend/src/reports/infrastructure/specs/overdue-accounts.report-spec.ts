import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { ReportSpec } from '../../interfaces/report-spec.interface';
import type { OverdueAccountsFilterDto } from '../../interfaces/dto/overdue-accounts-filter.dto';

export interface MorosoItem {
  contratoId: string;
  numeroGuia: string;
  clienteNombre: string;
  identificacion: string;
  sectorNombre: string;
  mesesVencidos: number;
  saldoPendiente: string;
  saldoPendienteNum: number;
  ultimaEmision: string;
  medidorSerie: string;
}

@Injectable()
export class OverdueAccountsReportSpec implements ReportSpec<OverdueAccountsFilterDto> {
  readonly type = 'recaudacion-morosidad';

  constructor(private readonly prisma: PrismaService) {}

  async fetchData(
    filters: OverdueAccountsFilterDto,
  ): Promise<Record<string, unknown>> {
    const fechaCorte = filters.fechaCorte ? new Date(filters.fechaCorte) : new Date();

    const prefacturas = await this.prisma.prefacturas.findMany({
      where: {
        deletedAt: null,
        estado: { notIn: ['ANULADA', 'PAGADA'] },
        saldoActual: { gt: 0 },
        ...(filters.contratoId ? { contratoId: BigInt(filters.contratoId) } : {}),
        ...(filters.clienteId
          ? { contrato: { clienteId: BigInt(filters.clienteId) } }
          : {}),
        ...(filters.sectorId
          ? { contrato: { sectorId: Number(filters.sectorId) } }
          : {}),
        periodoRel: {
          fechaFin: { lte: fechaCorte },
        },
      },
      include: {
        periodoRel: {
          select: { nombre: true, fechaInicio: true, fechaFin: true },
        },
        contrato: {
          include: {
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
                razonSocial: true,
                identificacion: true,
              },
            },
            sector: { select: { nombre: true } },
            historialMedidores: {
              where: { fechaHasta: null },
              take: 1,
              select: { medidor: { select: { serie: true } } },
            },
          },
        },
      },
      orderBy: { periodoRel: { fechaInicio: 'asc' } },
    });

    // Agrupar por contratoId
    const contratosMap = new Map<string, {
      contratoId: string;
      numeroGuia: string;
      clienteNombre: string;
      identificacion: string;
      sectorNombre: string;
      medidorSerie: string;
      prefacturas: typeof prefacturas;
      totalSaldo: number;
      ultimaEmision: string;
    }>();

    for (const pf of prefacturas) {
      const cId = String(pf.contratoId);
      const cliente = pf.contrato?.cliente;
      const clienteNombre =
        [cliente?.nombres, cliente?.apellidos].filter(Boolean).join(' ') ||
        cliente?.razonSocial ||
        '—';
      const identificacion = cliente?.identificacion || '—';
      const sectorNombre = pf.contrato?.sector?.nombre || '—';
      const numeroGuia = pf.contrato?.numeroGuia || cId;
      const medidorSerie = pf.contrato?.historialMedidores?.[0]?.medidor?.serie || '—';
      const saldo = Number(pf.saldoActual || 0);
      const emision = pf.periodoRel?.nombre || '—';

      if (!contratosMap.has(cId)) {
        contratosMap.set(cId, {
          contratoId: cId,
          numeroGuia,
          clienteNombre,
          identificacion,
          sectorNombre,
          medidorSerie,
          prefacturas: [],
          totalSaldo: 0,
          ultimaEmision: emision,
        });
      }

      const item = contratosMap.get(cId)!;
      item.prefacturas.push(pf);
      item.totalSaldo += saldo;
      item.ultimaEmision = emision;
    }

    const morosos: MorosoItem[] = Array.from(contratosMap.values()).map((c) => ({
      contratoId: c.contratoId,
      numeroGuia: c.numeroGuia,
      clienteNombre: c.clienteNombre,
      identificacion: c.identificacion,
      sectorNombre: c.sectorNombre,
      mesesVencidos: c.prefacturas.length,
      saldoPendiente: c.totalSaldo.toFixed(2),
      saldoPendienteNum: c.totalSaldo,
      ultimaEmision: c.ultimaEmision,
      medidorSerie: c.medidorSerie,
    }));

    // Ordenar de mayor a menor deuda
    morosos.sort((a, b) => b.saldoPendienteNum - a.saldoPendienteNum);

    const totalMorosidad = morosos.reduce((acc, m) => acc + m.saldoPendienteNum, 0);
    const mayorDeuda = morosos.length > 0 ? morosos[0].saldoPendienteNum : 0;

    return {
      data: morosos,
      meta: {
        total: morosos.length,
        fechaCorte: fechaCorte.toLocaleDateString('es-EC'),
      },
      kpis: {
        totalMorosidad: totalMorosidad.toFixed(2),
        totalMorosos: morosos.length,
        mayorDeuda: mayorDeuda.toFixed(2),
      },
    };
  }
}
