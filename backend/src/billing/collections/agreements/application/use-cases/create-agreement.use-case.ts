import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { DateUtil } from 'src/shared/utils/date.util';
import { addMonths } from 'date-fns';
import { CreateAgreementDto } from '../../interfaces/dto/create-agreement.dto';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import type { CreateInstallmentData } from '../../domain/types/agreement.types';
import type { AgreementEntity } from '../../domain/entities/agreement.entity';

@Injectable()
export class CreateAgreementUseCase {
  constructor(
    private readonly agreementRepository: AgreementRepository,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
  ) {}

  async execute(dto: CreateAgreementDto): Promise<AgreementEntity> {
    const contratoId = BigInt(dto.contratoId);

    // ── 1. Verificar que el contrato existe ──────────────────────────────────
    const contractExists =
      await this.agreementRepository.contractExists(contratoId);

    if (!contractExists) {
      throw new NotFoundException(
        `Contrato con ID ${dto.contratoId} no encontrado`,
      );
    }

    // ── 2. Verificar que no haya convenio activo o pendiente para este contrato ─
    const convenioActivo =
      await this.agreementRepository.findActiveByContractId(contratoId);

    if (convenioActivo) {
      throw new BadRequestException(
        `El contrato ya tiene un convenio en estado ${convenioActivo.estado}. ` +
          `Debe finalizarse o anularse antes de crear uno nuevo.`,
      );
    }

    // ── 3. Calcular deuda total desde prefacturas impagadas ──────────────────
    const debtSummary = await this.getDebtSummaryUseCase.execute(contratoId);

    if (debtSummary.deudaTotal <= 0) {
      throw new BadRequestException(
        'El contrato no tiene deuda pendiente. No es posible crear un convenio.',
      );
    }

    const deudaTotal = debtSummary.deudaTotal;
    const abonoInicial = dto.abonoInicial ?? 0;

    if (abonoInicial >= deudaTotal) {
      throw new BadRequestException(
        `El abono inicial (${abonoInicial}) no puede ser mayor o igual a la deuda total (${deudaTotal}).`,
      );
    }

    // ── 4. Obtener tasa de interés por mora vigente (ParametroTasainteres) ───
    const tasaInteres = await this.agreementRepository.findActiveInterestRate();
    const tasaMensual = tasaInteres ? tasaInteres / 100 : 0;

    // ── 5. mesesMoraActual: tomar máximo de meses atrasados desde debtSummary ──
    const mesesMoraActual = debtSummary.maxMesesAtrasado ?? 0;

    // ── 6. Calcular intereses sobre el monto a financiar con Decimal.js ────
    const dDeudaTotal = new Decimal(deudaTotal);
    const dAbonoInicial = new Decimal(abonoInicial);
    const dMontoAFinanciar = dDeudaTotal.minus(dAbonoInicial);
    const dNumeroCuotas = new Decimal(dto.numeroCuotas);
    const dTasaMensual = new Decimal(tasaMensual);

    const dInteresesTotales = dMontoAFinanciar
      .times(dTasaMensual)
      .times(dNumeroCuotas)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // Monto total a distribuir en cuotas: deuda neta + intereses
    const dTotalADistribuir = dMontoAFinanciar.plus(dInteresesTotales);

    // ── 7. Calcular valor de cada cuota (base y residuo de última cuota) ──────
    const dValorCuotaBase = dTotalADistribuir
      .dividedBy(dNumeroCuotas)
      .toDecimalPlaces(2, Decimal.ROUND_DOWN);

    const dTotalDistribuido = dValorCuotaBase.times(dNumeroCuotas.minus(1));
    const dValorUltimaCuota = dTotalADistribuir
      .minus(dTotalDistribuido)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const dInteresPorCuota =
      dto.numeroCuotas > 0
        ? dInteresesTotales
            .dividedBy(dNumeroCuotas)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        : new Decimal(0);

    const valorCuotaBase = dValorCuotaBase.toNumber();
    const valorUltimaCuota = dValorUltimaCuota.toNumber();
    const interesPorCuota = dInteresPorCuota.toNumber();

    // ── 8. Determinar estado del convenio ────────────────────────────────────
    const estadoConvenio = abonoInicial > 0 ? 'PENDIENTE_ABONO' : 'PREPARADO';

    // ── 9. Parsear fecha primer pago ─────────────────────────────────────────
    const fechaPrimerPago = DateUtil.parseFrontendDateStrict(
      dto.fechaPrimerPago,
    );

    // ── 10. Crear cuotas en memoria ──────────────────────────────────────────
    const cuotas: CreateInstallmentData[] = [];
    for (let i = 1; i <= dto.numeroCuotas; i++) {
      const valorCuota =
        i === dto.numeroCuotas ? valorUltimaCuota : valorCuotaBase;
      const fechaVencimiento = addMonths(fechaPrimerPago, i - 1);

      cuotas.push({
        numeroCuota: i,
        valorCuota,
        saldoPendiente: valorCuota,
        fechaVencimiento,
        estado: 'PENDIENTE',
        montoPagado: 0,
        diasRetraso: 0,
        interesMoraAplicado: interesPorCuota,
        pagoCompleto: false,
      });
    }

    return this.agreementRepository.create(
      {
        contratoId,
        numeroCuotas: dto.numeroCuotas,
        abonoInicial,
        deudaTotal,
        mesesMoraActual,
        estado: estadoConvenio,
        fechaPrimerPago,
        fechaProximoPago: fechaPrimerPago,
        montoPagadoActual: 0,
        motivo: dto.motivo ?? null,
      },
      cuotas,
    );
  }
}
