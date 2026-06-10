import { Injectable, NotFoundException } from '@nestjs/common';
import { DateUtil } from 'src/infrastructure/common/utils/date.util';
import type {
  DebtSummaryResponseDto,
  PrefacturaDeudaItemDto,
} from '../../interfaces/dto/debt-summary-response.dto';
import type { EstadoPrefactura } from '@generated/prisma/enums';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

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
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(contratoId: bigint): Promise<DebtSummaryResponseDto> {
    const contrato = await this.agreementRepository.findFirstContrato(
      { contratoId, deletedAt: null },
      { contratoId: true },
    );

    if (!contrato) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    const prefacturasImpagadas =
      await this.agreementRepository.findManyPrefacturas({
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
      const totalPagar = Math.round(Number(p.totalPagar) * 100) / 100;
      const abono = Math.round(Number(p.abono) * 100) / 100;
      const saldoPendiente =
        Math.round(
          Math.max(0, Number(p.saldoActual ?? totalPagar - abono)) * 100,
        ) / 100;

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

    const hoy = new Date();
    const tasaInteresParam =
      await this.agreementRepository.findFirstParametroTasainteres(
        {
          activo: true,
          vigenteDesde: { lte: hoy },
          OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: hoy } }],
          deletedAt: null,
        },
        { vigenteDesde: 'desc' },
        { tasa: true },
      );

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
