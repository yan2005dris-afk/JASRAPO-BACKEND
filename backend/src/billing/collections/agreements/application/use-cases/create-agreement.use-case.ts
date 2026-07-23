import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { Prisma } from 'src/generated/prisma/client';
import { DateUtil } from 'src/shared/utils/date.util';
import { addMonths } from 'date-fns';
import { EstadoConvenio } from 'src/shared/enums';
import { CreateAgreementDto } from '../../interfaces/dto/create-agreement.dto';
import { safeAgreementWithInstallmentsSelect } from '../../domain/types/IAgreement';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

/**
 * Lógica de creación de un convenio de pago:
 *
 * 1. Valida que el contrato existe y no tiene ya un convenio ACTIVO o PENDIENTE_ABONO
 * 2. Calcula la deuda total desde las prefacturas impagadas
 * 3. Calcula el interés por mora según ParametroTasainteres activo
 * 4. Crea el convenio con estado PREPARADO (o PENDIENTE_ABONO si hay abono inicial)
 * 5. Genera N cuotas automáticamente:
 *    - valorCuota = (deudaTotal - abonoInicial + interesesMora) / numeroCuotas
 *    - fechaVencimiento = fechaPrimerPago + (i-1) meses
 *    - saldoPendiente = valorCuota (empieza sin pagar)
 *    - estado = PENDIENTE
 */
@Injectable()
export class CreateAgreementUseCase {
  constructor(
    private readonly agreementRepository: AgreementRepository,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
  ) {}

  async execute(dto: CreateAgreementDto) {
    const contratoId = BigInt(dto.contratoId);

    // ── 1. Verificar que el contrato existe ──────────────────────────────────
    const contrato = await this.agreementRepository.findFirstContrato(
      { contratoId, deletedAt: null },
      { contratoId: true },
    );

    if (!contrato) {
      throw new NotFoundException(
        `Contrato con ID ${dto.contratoId} no encontrado`,
      );
    }

    // ── 2. Verificar que no haya convenio activo o pendiente para este contrato ─
    const estadosBloquean: EstadoConvenio[] = ['ACTIVO', 'PENDIENTE_ABONO'];
    const convenioActivo = await this.agreementRepository.findFirstConvenio(
      {
        contratoId,
        deletedAt: null,
        estado: { in: estadosBloquean },
      },
      { convenioId: true, estado: true },
    );

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

    // tasa en porcentaje (ej: 1.5 = 1.5% mensual)
    const tasaMensual = tasaInteresParam ? tasaInteresParam.tasa / 100 : 0;

    // ── 5. mesesMoraActual: tomar máximo de meses atrasados desde debtSummary ──
    const mesesMoraActual = debtSummary.maxMesesAtrasado ?? 0;

    // ── 6. Calcular intereses sobre el monto a financiar ─────────────────────
    const montoAFinanciarDecimal = new Decimal(deudaTotal).minus(
      abonoInicial,
    );
    const interesesTotalesDecimal = montoAFinanciarDecimal
      .times(tasaMensual)
      .times(dto.numeroCuotas)
      .toDecimalPlaces(2);

    // Monto total a distribuir en cuotas: deuda neta + intereses
    const totalADistribuirDecimal = montoAFinanciarDecimal.plus(
      interesesTotalesDecimal,
    );

    // ── 7. Calcular valor de cada cuota ──────────────────────────────────────
    // Cuota base: se redondea hacia abajo (Decimal.ROUND_DOWN) y el remanente
    // se absorbe íntegramente en la última cuota para que la suma de todas
    // las cuotas coincida exactamente con totalADistribuir (sin drift de coma
    // flotante).
    const valorCuotaBaseDecimal = totalADistribuirDecimal
      .dividedBy(dto.numeroCuotas)
      .toDecimalPlaces(2, Decimal.ROUND_DOWN);
    const totalDistribuidoDecimal = valorCuotaBaseDecimal.times(
      dto.numeroCuotas - 1,
    );
    const valorUltimaCuotaDecimal = totalADistribuirDecimal
      .minus(totalDistribuidoDecimal)
      .toDecimalPlaces(2);

    const interesPorCuotaDecimal =
      dto.numeroCuotas > 0
        ? interesesTotalesDecimal.dividedBy(dto.numeroCuotas).toDecimalPlaces(2)
        : new Decimal(0);

    const montoAFinanciar = montoAFinanciarDecimal.toNumber();
    const interesesTotales = interesesTotalesDecimal.toNumber();
    const totalADistribuir = totalADistribuirDecimal.toNumber();
    const valorCuotaBase = valorCuotaBaseDecimal.toNumber();
    const valorUltimaCuota = valorUltimaCuotaDecimal.toNumber();
    const interesPorCuota = interesPorCuotaDecimal.toNumber();

    // ── 8. Determinar estado del convenio ────────────────────────────────────
    const estadoConvenio: EstadoConvenio =
      abonoInicial > 0 ? 'PENDIENTE_ABONO' : 'PREPARADO';

    // ── 9. Parsear fecha primer pago ─────────────────────────────────────────
    const fechaPrimerPago = DateUtil.parseFrontendDateStrict(
      dto.fechaPrimerPago,
    );

    // ── 10. Crear convenio + cuotas en una transacción ───────────────────────
    const convenioId = await this.agreementRepository.executeTransaction(
      async (tx) => {
        const nuevoConvenio = await tx.convenios.create({
          data: {
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
          select: { convenioId: true },
        });

        const cuotas: Prisma.CuotaConvenioCreateManyInput[] = [];
        for (let i = 1; i <= dto.numeroCuotas; i++) {
          const valorCuota =
            i === dto.numeroCuotas ? valorUltimaCuota : valorCuotaBase;
          const fechaVencimiento = addMonths(fechaPrimerPago, i - 1);

          cuotas.push({
            convenioId: nuevoConvenio.convenioId,
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

        await tx.cuotaConvenio.createMany({ data: cuotas });

        return nuevoConvenio.convenioId;
      },
    );

    return this.agreementRepository.findUniqueConvenio(
      { convenioId },
      safeAgreementWithInstallmentsSelect,
    );
  }
}
