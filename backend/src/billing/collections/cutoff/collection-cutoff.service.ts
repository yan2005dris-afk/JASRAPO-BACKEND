import { BadRequestException, Injectable } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SistemaConfigService } from 'src/infrastructure/config/sistema-config.service';
import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from 'src/infrastructure/config/sistema-config.keys';
import { EstadoCobranzaContrato } from 'src/shared/enums';
import { ContractState } from 'src/operations/contracts/domain/contract-state';
import { DebtCalculatorHelper } from 'src/shared/utils/debt-calculator.util';
import {
  COLLECTION_CUTOFF_DEFAULTS,
  COLLECTION_CUTOFF_EVALUATION_STATUS,
  type CollectionCutoffCandidate,
  type CollectionCutoffConfig,
} from './collection-cutoff.types';

const ECUADOR_TIME_ZONE = 'America/Guayaquil';

/**
 * Periodos stores one annual due date. Prefacturas.mes identifies the
 * monthly service invoice, so its due date must be reconstructed as a
 * calendar date in the period year. Dates are treated as date-only UTC
 * values, as they are persisted by the billing schema.
 */
export function deriveMonthlyDueDate(annualDueDate: Date, month: number): Date {
  const year = annualDueDate.getUTCFullYear();
  const dueDay = annualDueDate.getUTCDate();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1, Math.min(dueDay, daysInMonth)));
}

@Injectable()
export class CollectionCutoffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: SistemaConfigService,
  ) {}

  async getConfig(): Promise<CollectionCutoffConfig> {
    const values = await Promise.all([
      this.config.getString(COBRANZA_DIA_CORTE_MENSUAL),
      this.config.getString(COBRANZA_MESES_PARA_MORA),
      this.config.getString(COBRANZA_MESES_PARA_CORTE),
    ]);
    const parsed = {
      diaCorteMensual: this.parsePositiveInteger(
        values[0],
        COLLECTION_CUTOFF_DEFAULTS[COBRANZA_DIA_CORTE_MENSUAL],
        COBRANZA_DIA_CORTE_MENSUAL,
        31,
      ),
      mesesParaMora: this.parsePositiveInteger(
        values[1],
        COLLECTION_CUTOFF_DEFAULTS[COBRANZA_MESES_PARA_MORA],
        COBRANZA_MESES_PARA_MORA,
        120,
      ),
      mesesParaCorte: this.parsePositiveInteger(
        values[2],
        COLLECTION_CUTOFF_DEFAULTS[COBRANZA_MESES_PARA_CORTE],
        COBRANZA_MESES_PARA_CORTE,
        120,
      ),
    };
    if (parsed.mesesParaCorte < parsed.mesesParaMora) {
      throw new BadRequestException(
        `${COBRANZA_MESES_PARA_CORTE} debe ser mayor o igual que ${COBRANZA_MESES_PARA_MORA}`,
      );
    }
    return parsed;
  }

  isConfiguredEvaluationDay(now: Date, day: number): boolean {
    const year = Number(formatInTimeZone(now, ECUADOR_TIME_ZONE, 'yyyy'));
    const month = Number(formatInTimeZone(now, ECUADOR_TIME_ZONE, 'M'));
    const calendarDay = Number(formatInTimeZone(now, ECUADOR_TIME_ZONE, 'd'));
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return calendarDay === Math.min(day, lastDay);
  }

  async evaluate(now = new Date()): Promise<CollectionCutoffCandidate[]> {
    const policy = await this.getConfig();
    const rows = await this.prisma.prefacturas.findMany({
      where: {
        deletedAt: null,
        estado: { in: ['GENERADA', 'EN_REVISION', 'APROBADA'] },
        saldoActual: { gt: 0 },
        mes: { gt: 0 },
        contrato: {
          deletedAt: null,
          estadoServicio: 'ACTIVO',
        },
        periodoRel: { deletedAt: null },
        // An agreement installment is not current service debt.
        prefacturaDetalle: {
          none: { deletedAt: null, cuotaConvenioId: { not: null } },
        },
      },
      select: {
        contratoId: true,
        periodoId: true,
        mes: true,
        totalPagar: true,
        abono: true,
        saldoActual: true,
        periodoRel: { select: { fechaVencimiento: true } },
        contrato: {
          select: {
            numeroGuia: true,
            estadoCobranza: true,
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
                razonSocial: true,
                identificacion: true,
              },
            },
            comunidad: { select: { comunidadId: true, nombre: true } },
            convenios: {
              where: {
                deletedAt: null,
                estado: { in: ['ACTIVO', 'PENDIENTE_ABONO'] },
              },
              select: { convenioId: true },
              take: 1,
            },
          },
        },
      },
    });

    const dueRows = rows
      .filter((row) => {
        if (row.mes < 1 || row.mes > 12) return false;
        const dueDate = deriveMonthlyDueDate(
          row.periodoRel.fechaVencimiento,
          row.mes,
        );
        const ownPeriodBalance = DebtCalculatorHelper.saldoPendienteItem({
          totalPagar: row.totalPagar,
          abono: row.abono,
          periodoId: row.periodoId,
        });
        return dueDate <= now && ownPeriodBalance > 0;
      })
      .sort((a, b) => {
        const aDueDate = deriveMonthlyDueDate(
          a.periodoRel.fechaVencimiento,
          a.mes,
        );
        const bDueDate = deriveMonthlyDueDate(
          b.periodoRel.fechaVencimiento,
          b.mes,
        );
        return aDueDate.getTime() - bDueDate.getTime();
      });

    const rowsByContract = new Map<string, typeof dueRows>();
    for (const row of dueRows) {
      const contratoId = String(row.contratoId);
      const current = rowsByContract.get(contratoId) ?? [];
      current.push(row);
      rowsByContract.set(contratoId, current);
    }

    const candidates = new Map<string, CollectionCutoffCandidate>();
    for (const [contratoId, contractRows] of rowsByContract) {
      const first = contractRows[0];
      const totalDeuda = DebtCalculatorHelper.calcularSaldoVencido(
        contractRows.map((row) => ({
          totalPagar: row.totalPagar,
          abono: row.abono,
          periodoId: row.periodoId,
        })),
      );
      const periodosVencidos = DebtCalculatorHelper.calcularMesesAtrasado(
        contractRows.map((row) => ({
          totalPagar: row.totalPagar,
          abono: row.abono,
          periodoId: row.periodoId,
        })),
      );
      const tieneConvenioActivo = first.contrato.convenios.length > 0;
      const haAlcanzadoMora = periodosVencidos >= policy.mesesParaMora;
      const elegibleParaCorte = periodosVencidos >= policy.mesesParaCorte;
      candidates.set(contratoId, {
        contratoId,
        numeroGuia: first.contrato.numeroGuia,
        cliente: first.contrato.cliente,
        comunidad: first.contrato.comunidad,
        totalDeuda,
        periodosVencidos,
        // Debt below the mora threshold is visible to operators but must not
        // be persisted as EN_MORA.
        estadoCobranza: haAlcanzadoMora ? 'EN_MORA' : 'AL_DIA',
        estadoCobranzaPersistido: first.contrato.estadoCobranza,
        estadoEvaluacion: haAlcanzadoMora
          ? COLLECTION_CUTOFF_EVALUATION_STATUS.EN_MORA
          : COLLECTION_CUTOFF_EVALUATION_STATUS.DEUDA_PENDIENTE,
        tieneConvenioActivo,
        elegibleParaCorte,
        razon: elegibleParaCorte
          ? `${periodosVencidos} períodos de servicio vencidos; elegible para evaluación de corte`
          : haAlcanzadoMora
            ? `${periodosVencidos} períodos de servicio vencidos; EN_MORA, aún no elegible para corte`
            : `${periodosVencidos} períodos de servicio vencidos; deuda pendiente, requiere ${policy.mesesParaMora} para EN_MORA`,
      });
    }

    // This evaluator intentionally does not inspect unpaid convenio installments.
    return Array.from(candidates.values());
  }

  async evaluateAndUpdateStatus(
    now = new Date(),
  ): Promise<CollectionCutoffCandidate[]> {
    const evaluatedAt = new Date();
    const candidates = await this.evaluate(now);
    for (const candidate of candidates) {
      if (candidate.estadoCobranzaPersistido === candidate.estadoCobranza) {
        continue;
      }
      await this.prisma.contratos.updateMany({
        where: {
          contratoId: BigInt(candidate.contratoId),
          deletedAt: null,
          updatedAt: { lte: evaluatedAt },
          estadoCobranza: ContractState.normalizeCollectionStatus(
            candidate.estadoCobranzaPersistido,
          ),
        },
        data: { estadoCobranza: candidate.estadoCobranza },
      });
    }
    const activeContracts = await this.prisma.contratos.findMany({
      where: { deletedAt: null, estadoServicio: 'ACTIVO' },
      select: { contratoId: true },
    });
    const debtContractIds = candidates.map((candidate) =>
      BigInt(candidate.contratoId),
    );
    if (activeContracts.length > 0) {
      await this.prisma.contratos.updateMany({
        where: {
          deletedAt: null,
          estadoServicio: 'ACTIVO',
          estadoCobranza: EstadoCobranzaContrato.EN_MORA,
          ...(debtContractIds.length > 0 && {
            contratoId: { notIn: debtContractIds },
          }),
          updatedAt: { lte: evaluatedAt },
        },
        data: { estadoCobranza: EstadoCobranzaContrato.AL_DIA },
      });
    }
    return candidates;
  }

  private parsePositiveInteger(
    raw: string | null,
    fallback: number,
    key: string,
    max: number,
  ): number {
    if (raw === null) return fallback;
    if (!/^\d+$/.test(raw.trim())) {
      throw new BadRequestException(`${key} debe ser un entero positivo`);
    }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1 || value > max) {
      throw new BadRequestException(`${key} debe estar entre 1 y ${max}`);
    }
    return value;
  }
}
