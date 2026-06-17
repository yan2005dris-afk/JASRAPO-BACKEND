import { Injectable, NotFoundException } from '@nestjs/common';
import { DateUtil } from 'src/infrastructure/common/utils/date.util';
import type {
  DebtSummaryResponseDto,
  PrefacturaDeudaItemDto,
} from '../../interfaces/dto/debt-summary-response.dto';
import type { EstadoPrefactura } from '@generated/prisma/enums';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { DebtCalculatorHelper } from 'src/infrastructure/common/utils/debt-calculator.util';

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
          estado: { in: [...ESTADOS_DEUDA_PREFACTURA] },
        },
        select: {
          prefacturaId: true,
          periodoId: true,
          totalPagar: true,
          abono: true,
          estado: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

    const items: PrefacturaDeudaItemDto[] = prefacturasImpagadas.map((p) => ({
      prefacturaId: String(p.prefacturaId),
      periodoId: p.periodoId,
      totalPagar: Math.round(Number(p.totalPagar) * 100) / 100,
      abono: Math.round(Number(p.abono) * 100) / 100,
      saldoPendiente: DebtCalculatorHelper.saldoPendienteItem(p),
      estado: p.estado,
      fechaCreacion: DateUtil.formatForFrontend(p.createdAt),
    }));

    const deudaTotal = DebtCalculatorHelper.calcularSaldoVencido(prefacturasImpagadas);
    const deudaAnterior = DebtCalculatorHelper.calcularDeudaAnterior(prefacturasImpagadas);
    const maxMesesAtrasado = DebtCalculatorHelper.calcularMesesAtrasado(prefacturasImpagadas);

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

    return {
      contratoId: String(contratoId),
      deudaTotal,
      deudaAnterior,
      tasaMensualVigente: tasaInteresParam ? tasaInteresParam.tasa : 0,
      maxMesesAtrasado,
      totalPrefacturasImpagadas: items.length,
      prefacturas: items,
    };
  }
}
