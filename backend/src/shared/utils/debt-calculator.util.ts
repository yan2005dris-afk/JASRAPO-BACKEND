import Decimal from 'decimal.js';

export interface IPrefacturaParaCalculo {
  totalPagar:
    | number
    | string
    | Decimal
    | { toString?: () => string; toNumber?: () => number };
  abono:
    | number
    | string
    | Decimal
    | { toString?: () => string; toNumber?: () => number };
  periodoId: number;
}

function toDecimal(
  val:
    | number
    | string
    | Decimal
    | { toString?: () => string; toNumber?: () => number },
): Decimal {
  if (val instanceof Decimal) {
    return val;
  }
  if (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as any).toNumber === 'function'
  ) {
    return new Decimal((val as any).toNumber());
  }
  try {
    const d = new Decimal(val as any);
    if (!d.isFinite()) {
      throw new TypeError('Valor numérico inválido en cálculo de deuda');
    }
    return d;
  } catch {
    throw new TypeError('Valor numérico inválido en cálculo de deuda');
  }
}

export class DebtCalculatorHelper {
  static saldoPendienteItem(p: IPrefacturaParaCalculo): number {
    const totalPagar = toDecimal(p.totalPagar);
    const abono = toDecimal(p.abono);
    const saldo = Decimal.max(0, totalPagar.minus(abono));
    return saldo.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }

  static calcularSaldoVencido(prefacturas: IPrefacturaParaCalculo[]): number {
    const total = prefacturas.reduce((acc, p) => {
      const totalPagar = toDecimal(p.totalPagar);
      const abono = toDecimal(p.abono);
      const saldo = Decimal.max(0, totalPagar.minus(abono));
      return acc.plus(saldo);
    }, new Decimal(0));

    return total.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }

  static calcularMesesAtrasado(prefacturas: IPrefacturaParaCalculo[]): number {
    return prefacturas.filter((p) => {
      const totalPagar = toDecimal(p.totalPagar);
      const abono = toDecimal(p.abono);
      return totalPagar.minus(abono).greaterThan(0);
    }).length;
  }

  static calcularDeudaAnterior(prefacturas: IPrefacturaParaCalculo[]): number {
    if (prefacturas.length === 0) return 0;
    const maxPeriodoId = Math.max(...prefacturas.map((p) => p.periodoId));
    const anterior = prefacturas.find((p) => p.periodoId === maxPeriodoId - 1);
    if (!anterior) return 0;

    const totalPagar = toDecimal(anterior.totalPagar);
    const abono = toDecimal(anterior.abono);
    const saldo = Decimal.max(0, totalPagar.minus(abono));
    return saldo.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }
}
