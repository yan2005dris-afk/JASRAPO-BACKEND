import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { DateUtil } from 'src/infrastructure/common/util/date.util';
import type {
  DebtSummaryResponseDto,
  PrefacturaDeudaItemDto,
} from '../dto/debt-summary-response.dto';
import type { EstadoPrefactura } from '@generated/prisma/enums';

/**
 * Estados de prefactura que se consideran deuda pendiente.
 * Se excluyen: PAGADA, ANULADA, RECHAZADA
 */
const ESTADOS_DEUDA_PREFACTURA: readonly EstadoPrefactura[] = [
  'GENERADA',
  'EN_REVISION',
  'APROBADA',
];

@Injectable()
export class GetDebtSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(contratoId: bigint): Promise<DebtSummaryResponseDto> {
    // Verificar que el contrato existe
    const contrato = await this.prisma.contratos.findFirst({
      where: { contratoId, deletedAt: null },
      select: { contratoId: true },
    });

    if (!contrato) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    // ── Obtener prefacturas impagadas del contrato ───────────────────────────
    const prefacturasImpagadas = await this.prisma.prefacturas.findMany({
      where: {
        contratoId,
        deletedAt: null,
        estado: {
          in: [...ESTADOS_DEUDA_PREFACTURA],
        },
      },
      select: {
        prefacturaId: true,
        periodoId: true,
        totalPagar: true,
        abono: true,
        saldoActual: true,
        meses_atrasado: true,
        estado: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const items: PrefacturaDeudaItemDto[] = prefacturasImpagadas.map((p) => {
      const totalPagar = Number(p.totalPagar);
      const abono = Number(p.abono);
      const saldoPendiente = Math.max(
        0,
        Number(p.saldoActual ?? totalPagar - abono),
      );

      return {
        prefacturaId: String(p.prefacturaId),
        periodoId: p.periodoId,
        totalPagar,
        abono,
        saldoPendiente,
        estado: p.estado,
        fechaCreacion: DateUtil.formatForFrontend(p.createdAt),
      };
    });

    const deudaTotal =
      Math.round(
        items.reduce((acc, item) => acc + item.saldoPendiente, 0) * 100,
      ) / 100;

    const maxMesesAtrasado = prefacturasImpagadas.reduce(
      (max, p) => Math.max(max, p.meses_atrasado ?? 0),
      0,
    );

    // Obtener tasa de interés vigente para informar al frontend
    const hoy = new Date();
    const tasaInteresParam = await this.prisma.parametroTasainteres.findFirst({
      where: {
        activo: true,
        vigenteDesde: { lte: hoy },
        OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: hoy } }],
        deletedAt: null,
      },
      orderBy: { vigenteDesde: 'desc' },
      select: { tasa: true },
    });

    const tasaMensualVigente = tasaInteresParam ? tasaInteresParam.tasa : 0;

    return {
      contratoId: String(contratoId),
      deudaTotal,
      tasaMensualVigente,
      maxMesesAtrasado,
      totalPrefacturasImpagadas: items.length,
      prefacturas: items,
    };
  }
}
