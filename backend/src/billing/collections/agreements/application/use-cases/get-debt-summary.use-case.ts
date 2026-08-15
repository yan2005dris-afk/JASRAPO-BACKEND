import { Injectable, NotFoundException } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import type {
  DebtSummaryResponseDto,
  PrefacturaDeudaItemDto,
} from '../../interfaces/dto/debt-summary-response.dto';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { DebtCalculatorHelper } from 'src/shared/utils/debt-calculator.util';

@Injectable()
export class GetDebtSummaryUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(contratoId: bigint): Promise<DebtSummaryResponseDto> {
    const contractExists =
      await this.agreementRepository.contractExists(contratoId);

    if (!contractExists) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    const prefacturasImpagadas =
      await this.agreementRepository.findUnpaidPreInvoices(contratoId);

    const items: PrefacturaDeudaItemDto[] = prefacturasImpagadas.map((p) => ({
      prefacturaId: String(p.prefacturaId),
      periodoId: p.periodoId,
      totalPagar: Math.round(Number(p.totalPagar) * 100) / 100,
      abono: Math.round(Number(p.abono) * 100) / 100,
      saldoPendiente: DebtCalculatorHelper.saldoPendienteItem(p as any),
      estado: p.estado,
      fechaCreacion: DateUtil.formatForFrontend(p.createdAt),
    }));

    const deudaTotal =
      DebtCalculatorHelper.calcularSaldoVencido(prefacturasImpagadas);
    const deudaAnterior =
      DebtCalculatorHelper.calcularDeudaAnterior(prefacturasImpagadas);
    const maxMesesAtrasado =
      DebtCalculatorHelper.calcularMesesAtrasado(prefacturasImpagadas);

    const tasaInteres = await this.agreementRepository.findActiveInterestRate();

    return {
      contratoId: String(contratoId),
      deudaTotal,
      deudaAnterior,
      tasaMensualVigente: tasaInteres ?? 0,
      maxMesesAtrasado,
      totalPrefacturasImpagadas: items.length,
      prefacturas: items,
    };
  }
}
