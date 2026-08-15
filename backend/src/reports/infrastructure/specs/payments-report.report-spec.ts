import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { ReportSpec } from '../../interfaces/report-spec.interface';
import type { PaymentsReportFilterDto } from '../../dto/payments-report-filter.dto';

@Injectable()
export class PaymentsReportSpec implements ReportSpec<PaymentsReportFilterDto> {
  readonly type = 'payments-report';

  constructor(private readonly prisma: PrismaService) {}

  async fetchData(
    filters: PaymentsReportFilterDto,
  ): Promise<Record<string, unknown>> {
    const pagos = await this.prisma.pagos.findMany({
      where: {
        deletedAt: null,
        estadoValidacion: { not: 'RECHAZADO' },
        ...(filters.fechaDesde || filters.fechaHasta
          ? {
              fechaPago: {
                ...(filters.fechaDesde
                  ? { gte: new Date(filters.fechaDesde) }
                  : {}),
                ...(filters.fechaHasta
                  ? { lte: new Date(filters.fechaHasta) }
                  : {}),
              },
            }
          : {}),
        ...(filters.clienteId ? { clienteId: BigInt(filters.clienteId) } : {}),
        detallePago: { some: { tipoPago: 'COMPROBANTE', deletedAt: null } },
      },
      include: {
        cliente: {
          select: {
            nombres: true,
            apellidos: true,
            razonSocial: true,
            identificacion: true,
          },
        },
        detallePago: {
          where: { tipoPago: 'COMPROBANTE', deletedAt: null },
          include: {
            comprobante: {
              include: {
                prefactura: {
                  include: {
                    periodoRel: { select: { nombre: true } },
                    contrato: {
                      select: {
                        contratoId: true,
                        historialMedidores: {
                          where: { fechaHasta: null },
                          take: 1,
                          select: { medidor: { select: { serie: true } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fechaPago: 'asc' },
    });

    const rows: Record<string, unknown>[] = [];

    for (const pago of pagos) {
      const clienteNombre =
        [pago.cliente?.nombres, pago.cliente?.apellidos]
          .filter(Boolean)
          .join(' ') ||
        pago.cliente?.razonSocial ||
        '—';

      for (const detalle of pago.detallePago) {
        const comprobante = detalle.comprobante;
        const prefactura = comprobante?.prefactura;
        const cuenta = prefactura?.contrato
          ? String(prefactura.contrato.contratoId)
          : '—';
        const medidor =
          prefactura?.contrato?.historialMedidores?.[0]?.medidor?.serie ?? '—';
        const factura = comprobante?.secuencial ?? '—';
        const emision = comprobante?.fechaEmision
          ? new Date(comprobante.fechaEmision).toLocaleDateString('es-EC', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—';
        const valorNum = Number(detalle.montoAbonado);

        rows.push({
          factura,
          fecha: new Date(pago.fechaPago).toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          clienteNombre,
          cuenta,
          medidor,
          emision,
          valor: valorNum.toFixed(2),
          valorNum,
        });
      }
    }

    const totalGeneral = rows.reduce(
      (sum, r) => sum + (r['valorNum'] as number),
      0,
    );

    return {
      pagos: rows,
      fechaDesde: filters.fechaDesde ?? null,
      fechaHasta: filters.fechaHasta ?? null,
      totalGeneral: totalGeneral.toFixed(2),
      totalRegistros: rows.length,
    };
  }
}
