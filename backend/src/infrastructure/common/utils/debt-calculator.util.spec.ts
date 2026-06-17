import { DebtCalculatorHelper } from './debt-calculator.util';
import type { IPrefacturaParaCalculo } from './debt-calculator.util';

describe('DebtCalculatorHelper', () => {
  describe('calcularSaldoVencido', () => {
    it('should ignore fully paid periods and sum only positive balances', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 100, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];

      expect(DebtCalculatorHelper.calcularSaldoVencido(prefacturas)).toBe(80);
    });

    it('should handle Prisma Decimal objects via toNumber()', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        {
          totalPagar: { toNumber: () => 150 },
          abono: { toNumber: () => 50 },
          periodoId: 202601,
        },
      ];

      expect(DebtCalculatorHelper.calcularSaldoVencido(prefacturas)).toBe(100);
    });
  });

  describe('calcularDeudaAnterior', () => {
    it('should return the saldo of the period immediately before the most recent one', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 60, abono: 0, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];

      // max = 202602 → busca 202601 → saldo = 60
      expect(DebtCalculatorHelper.calcularDeudaAnterior(prefacturas)).toBe(60);
    });

    it('should return 0 when there is no preceding period', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 60, abono: 0, periodoId: 202601 },
      ];

      // max = 202601 → busca 202600 → no existe → 0
      expect(DebtCalculatorHelper.calcularDeudaAnterior(prefacturas)).toBe(0);
    });
  });

  describe('calcularMesesAtrasado', () => {
    it('should not count periods where balance is fully paid', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 100, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
        { totalPagar: 50, abono: 25, periodoId: 202603 },
      ];

      // 202601 pagado completo → no cuenta; 202602 y 202603 tienen saldo → 2
      expect(DebtCalculatorHelper.calcularMesesAtrasado(prefacturas)).toBe(2);
    });
  });
});
