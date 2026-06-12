interface PrefacturaParaCalculo {
  totalPagar: number | { toNumber?: () => number };
  abono: number | { toNumber?: () => number };
  periodoId: number;
}

function toNum(val: number | { toNumber?: () => number }): number {
  if (typeof val === 'object' && val !== null && typeof (val as any).toNumber === 'function') {
    return (val as any).toNumber();
  }
  return Number(val);
}

export class DebtCalculatorHelper {
  static saldoPendienteItem(p: PrefacturaParaCalculo): number {
    return Math.round(Math.max(0, toNum(p.totalPagar) - toNum(p.abono)) * 100) / 100;
  }

  static calcularSaldoVencido(prefacturas: PrefacturaParaCalculo[]): number {
    const total = prefacturas.reduce(
      (acc, p) => acc + Math.max(0, toNum(p.totalPagar) - toNum(p.abono)),
      0,
    );
    return Math.round(total * 100) / 100;
  }

  static calcularMesesAtrasado(prefacturas: PrefacturaParaCalculo[]): number {
    return prefacturas.filter(
      (p) => Math.max(0, toNum(p.totalPagar) - toNum(p.abono)) > 0,
    ).length;
  }

  static calcularDeudaAnterior(prefacturas: PrefacturaParaCalculo[]): number {
    if (prefacturas.length === 0) return 0;
    const maxPeriodoId = Math.max(...prefacturas.map((p) => p.periodoId));
    const anterior = prefacturas.find((p) => p.periodoId === maxPeriodoId - 1);
    if (!anterior) return 0;
    return Math.round(Math.max(0, toNum(anterior.totalPagar) - toNum(anterior.abono)) * 100) / 100;
  }
}
