import { Decimal } from 'decimal.js';

export interface IPrefacturaParaCalculo {
  totalPagar: number | { toNumber?: () => number };
  abono: number | { toNumber?: () => number };
  periodoId: number;
}

function toNum(val: number | { toNumber?: () => number }): number {
  if (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as any).toNumber === 'function'
  ) {
    return (val as any).toNumber();
  }
  const n = Number(val);
  if (!Number.isFinite(n)) {
    throw new TypeError('Valor numérico inválido en cálculo de deuda');
  }
  return n;
}

function saldoItemDecimal(
  totalPagar: number | { toNumber?: () => number },
  abono: number | { toNumber?: () => number },
): Decimal {
  const saldo = new Decimal(toNum(totalPagar)).minus(toNum(abono));
  return Decimal.max(0, saldo);
}

export class DebtCalculatorHelper {
  static saldoPendienteItem(p: IPrefacturaParaCalculo): number {
    return saldoItemDecimal(p.totalPagar, p.abono)
      .toDecimalPlaces(2)
      .toNumber();
  }

  static calcularSaldoVencido(prefacturas: IPrefacturaParaCalculo[]): number {
    const total = prefacturas.reduce(
      (acc, p) => acc.plus(saldoItemDecimal(p.totalPagar, p.abono)),
      new Decimal(0),
    );
    return total.toDecimalPlaces(2).toNumber();
  }

  static calcularMesesAtrasado(prefacturas: IPrefacturaParaCalculo[]): number {
    return prefacturas.filter((p) =>
      saldoItemDecimal(p.totalPagar, p.abono).greaterThan(0),
    ).length;
  }

  static calcularDeudaAnterior(prefacturas: IPrefacturaParaCalculo[]): number {
    if (prefacturas.length === 0) return 0;
    const maxPeriodoId = Math.max(...prefacturas.map((p) => p.periodoId));
    const anterior = prefacturas.find((p) => p.periodoId === maxPeriodoId - 1);
    if (!anterior) return 0;
    return saldoItemDecimal(anterior.totalPagar, anterior.abono)
      .toDecimalPlaces(2)
      .toNumber();
  }
}
