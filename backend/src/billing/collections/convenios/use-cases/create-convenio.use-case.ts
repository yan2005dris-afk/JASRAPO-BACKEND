import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { DateUtil } from 'src/infrastructure/common/util/date.util';
import { CreateConvenioDto } from '../dto/create-convenio.dto';
import { safeConvenioWithCuotasSelect } from '../types/IConvenio';
import { GetDebtSummaryUseCase } from './get-debt-summary.use-case';

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
export class CreateConvenioUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
  ) {}

  async execute(dto: CreateConvenioDto) {
    const contratoId = BigInt(dto.contratoId);

    // ── 1. Verificar que el contrato existe ──────────────────────────────────
    const contrato = await this.prisma.contratos.findFirst({
      where: { contratoId, deletedAt: null },
      select: { contratoId: true },
    });

    if (!contrato) {
      throw new NotFoundException(
        `Contrato con ID ${dto.contratoId} no encontrado`,
      );
    }

    // ── 2. Verificar que no haya convenio activo o pendiente para este contrato ─
    const estadosBloquean = ['ACTIVO', 'PENDIENTE_ABONO'];
    const convenioActivo = await this.prisma.convenios.findFirst({
      where: {
        contratoId,
        deletedAt: null,
        estado: {
          codigo: { in: estadosBloquean },
        },
      },
      select: { convenioId: true, estado: { select: { codigo: true } } },
    });

    if (convenioActivo) {
      throw new BadRequestException(
        `El contrato ya tiene un convenio en estado ${convenioActivo.estado.codigo}. ` +
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
    //    Según convenios.md: monto_cuota = (deuda_total + intereses) / numeroCuotas
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

    // tasa en porcentaje (ej: 1.5 = 1.5% mensual)
    const tasaMensual = tasaInteresParam ? tasaInteresParam.tasa / 100 : 0;

    // ── 5. mesesMoraActual: tomar máximo de meses atrasados desde debtSummary ──
    //    (calculado por el SP en la DB, unidad: meses calendario)
    const mesesMoraActual = debtSummary.maxMesesAtrasado ?? 0;

    // ── 6. Calcular intereses sobre el monto a financiar ─────────────────────
    //    interés simple: (deudaTotal - abonoInicial) × tasaMensual × numeroCuotas
    const montoAFinanciar = deudaTotal - abonoInicial;
    const interesesTotales =
      Math.round(montoAFinanciar * tasaMensual * dto.numeroCuotas * 100) / 100;

    // Monto total a distribuir en cuotas: deuda neta + intereses (convenios.md)
    const totalADistribuir = montoAFinanciar + interesesTotales;

    // ── 7. Calcular valor de cada cuota ──────────────────────────────────────
    const valorCuotaBase =
      Math.floor((totalADistribuir / dto.numeroCuotas) * 100) / 100;
    // El residuo (por redondeo) va a la última cuota
    const totalDistribuido = valorCuotaBase * (dto.numeroCuotas - 1);
    const valorUltimaCuota =
      Math.round((totalADistribuir - totalDistribuido) * 100) / 100;

    // Interés proporcional por cuota (para trazabilidad)
    const interesPorCuota =
      dto.numeroCuotas > 0
        ? Math.round((interesesTotales / dto.numeroCuotas) * 100) / 100
        : 0;

    // ── 8. Obtener IDs de estados desde la DB ────────────────────────────────
    const [estadoPreparado, estadoPendienteAbono, estadoCuotaPendiente] =
      await Promise.all([
        this.prisma.estadoConvenio.findUnique({
          where: { codigo: 'PREPARADO' },
          select: { estadoConvenioId: true },
        }),
        this.prisma.estadoConvenio.findUnique({
          where: { codigo: 'PENDIENTE_ABONO' },
          select: { estadoConvenioId: true },
        }),
        this.prisma.estadoCuotaConvenio.findUnique({
          where: { codigo: 'PENDIENTE' },
          select: { estadoCuotaConvenioId: true },
        }),
      ]);

    if (!estadoPreparado || !estadoPendienteAbono || !estadoCuotaPendiente) {
      throw new BadRequestException(
        'No se encontraron los estados necesarios en la base de datos. ' +
          'Verifique que la migración de estados se ejecutó correctamente.',
      );
    }

    // Usar PENDIENTE_ABONO si hay abono inicial, PREPARADO si no
    const estadoConvenioId =
      abonoInicial > 0
        ? estadoPendienteAbono.estadoConvenioId
        : estadoPreparado.estadoConvenioId;

    // ── 9. Parsear fecha primer pago ─────────────────────────────────────────
    const fechaPrimerPago = DateUtil.parseFrontendDateStrict(
      dto.fechaPrimerPago,
    );

    // ── 10. Crear convenio + cuotas en una transacción ───────────────────────
    const convenioId = await this.prisma.$transaction(async (tx) => {
      // Crear el convenio
      const nuevoConvenio = await tx.convenios.create({
        data: {
          contratoId,
          numeroCuotas: dto.numeroCuotas,
          abonoInicial,
          deudaTotal, // deuda bruta desde prefacturas (sin intereses)
          mesesMoraActual,
          estadoConvenioId,
          fechaPrimerPago,
          fechaProximoPago: fechaPrimerPago,
          montoPagadoActual: 0,
          motivo: dto.motivo ?? null,
        },
        select: { convenioId: true },
      });

      // Generar las cuotas automáticamente
      const cuotas: Prisma.CuotaConvenioCreateManyInput[] = [];
      for (let i = 1; i <= dto.numeroCuotas; i++) {
        const valorCuota =
          i === dto.numeroCuotas ? valorUltimaCuota : valorCuotaBase;

        // Fecha de vencimiento: fechaPrimerPago + (i-1) meses
        const fechaVencimiento = new Date(fechaPrimerPago);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1));

        cuotas.push({
          convenioId: nuevoConvenio.convenioId,
          numeroCuota: i,
          valorCuota,
          saldoPendiente: valorCuota,
          fechaVencimiento,
          estadoCuotaConvenioId: estadoCuotaPendiente.estadoCuotaConvenioId,
          montoPagado: 0,
          diasRetraso: 0,
          interesMoraAplicado: interesPorCuota,
          pagoCompleto: false,
        });
      }

      await tx.cuotaConvenio.createMany({ data: cuotas });

      return nuevoConvenio.convenioId;
    });

    // ── 11. Retornar el convenio creado con sus cuotas ───────────────────────
    return this.prisma.convenios.findUnique({
      where: { convenioId },
      select: safeConvenioWithCuotasSelect,
    });
  }
}
