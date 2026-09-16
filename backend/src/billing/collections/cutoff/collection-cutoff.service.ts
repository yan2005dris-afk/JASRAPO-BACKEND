import { Injectable } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SistemaConfigService } from 'src/infrastructure/config/sistema-config.service';
import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from 'src/infrastructure/config/sistema-config.keys';
import { EstadoCobranzaContrato } from 'src/shared/enums';
import { DebtCalculatorHelper } from 'src/shared/utils/debt-calculator.util';
import {
  COLLECTION_CUTOFF_DEFAULTS,
  COLLECTION_CUTOFF_EVALUATION_STATUS,
  type CollectionCutoffCandidate,
  type CollectionCutoffConfig,
} from './collection-cutoff.types';

const ECUADOR_TIME_ZONE = 'America/Guayaquil';

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
      throw new Error(
        `${COBRANZA_MESES_PARA_CORTE} debe ser mayor o igual que ${COBRANZA_MESES_PARA_MORA}`,
      );
    }
    return parsed;
  }

  isConfiguredEvaluationDay(now: Date, day: number): boolean {
    return Number(formatInTimeZone(now, ECUADOR_TIME_ZONE, 'd')) === day;
  }

  async evaluate(now = new Date()): Promise<CollectionCutoffCandidate[]> {
    const policy = await this.getConfig();
    const rows = await this.prisma.prefacturas.findMany({
      where: {
        deletedAt: null,
        estado: { notIn: ['ANULADA', 'PAGADA'] },
        saldoActual: { gt: 0 },
        contrato: {
          deletedAt: null,
          estadoServicio: { not: 'RETIRADO' },
        },
        periodoRel: { fechaVencimiento: { lte: now }, deletedAt: null },
        // An agreement installment is not current service debt.
        prefacturaDetalle: {
          none: { deletedAt: null, cuotaConvenioId: { not: null } },
        },
      },
      select: {
        contratoId: true,
        periodoId: true,
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
      orderBy: { periodoRel: { fechaVencimiento: 'asc' } },
    });

    const rowsByContract = new Map<string, typeof rows>();
    for (const row of rows) {
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
          totalPagar: row.saldoActual,
          abono: 0,
          periodoId: row.periodoId,
        })),
      );
      const periodosVencidos = DebtCalculatorHelper.calcularMesesAtrasado(
        contractRows.map((row) => ({
          totalPagar: row.saldoActual,
          abono: 0,
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
      if (
        candidate.estadoCobranzaPersistido !== EstadoCobranzaContrato.AL_DIA &&
        candidate.estadoCobranzaPersistido !== EstadoCobranzaContrato.EN_MORA
      ) {
        // Preserve legacy EN_CONVENIO (and any future non-collection state).
        continue;
      }
      await this.prisma.contratos.updateMany({
        where: {
          contratoId: BigInt(candidate.contratoId),
          deletedAt: null,
          updatedAt: { lte: evaluatedAt },
          // EN_CONVENIO remains a compatibility value owned by legacy consumers.
          estadoCobranza: candidate.estadoCobranzaPersistido,
        },
        data: { estadoCobranza: candidate.estadoCobranza },
      });
    }
    const activeContracts = await this.prisma.contratos.findMany({
      where: { deletedAt: null, estadoServicio: { not: 'RETIRADO' } },
      select: { contratoId: true },
    });
    const debtContractIds = new Set(
      candidates.map((candidate) => candidate.contratoId),
    );
    for (const contract of activeContracts) {
      if (debtContractIds.has(String(contract.contratoId))) continue;
      await this.prisma.contratos.updateMany({
        where: {
          contratoId: contract.contratoId,
          deletedAt: null,
          updatedAt: { lte: evaluatedAt },
          estadoCobranza: {
            in: [EstadoCobranzaContrato.AL_DIA, EstadoCobranzaContrato.EN_MORA],
          },
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
      throw new Error(`${key} debe ser un entero positivo`);
    }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1 || value > max) {
      throw new Error(`${key} debe estar entre 1 y ${max}`);
    }
    return value;
  }
}
