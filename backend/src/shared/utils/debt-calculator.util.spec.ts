import { DebtCalculatorHelper } from './debt-calculator.util';
import type { IPrefacturaParaCalculo } from './debt-calculator.util';

describe('DebtCalculatorHelper', () => {
  describe('calcularSaldoVencido', () => {
    it('should return 0 for an empty array', () => {
      expect(DebtCalculatorHelper.calcularSaldoVencido([])).toBe(0);
    });

    it('should ignore fully paid periods and sum only positive balances', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 100, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];

      expect(DebtCalculatorHelper.calcularSaldoVencido(prefacturas)).toBe(80);
    });

    it('should treat overpayment (abono > totalPagar) as 0 balance', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 50, abono: 100, periodoId: 202601 },
      ];

      expect(DebtCalculatorHelper.calcularSaldoVencido(prefacturas)).toBe(0);
    });

    it('should round result to 2 decimal places', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 10.336, abono: 0, periodoId: 202601 },
        { totalPagar: 10.336, abono: 0, periodoId: 202602 },
      ];

      // 20.672 → Math.round(20.672 * 100) / 100 = 20.67
      expect(DebtCalculatorHelper.calcularSaldoVencido(prefacturas)).toBe(
        20.67,
      );
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

    it('should throw TypeError when totalPagar is NaN', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: NaN, abono: 0, periodoId: 202601 },
      ];

      expect(() =>
        DebtCalculatorHelper.calcularSaldoVencido(prefacturas),
      ).toThrow(TypeError);
    });

    it('should throw TypeError when abono is Infinity', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: Infinity, periodoId: 202601 },
      ];

      expect(() =>
        DebtCalculatorHelper.calcularSaldoVencido(prefacturas),
      ).toThrow(TypeError);
    });
  });

  describe('calcularDeudaAnterior', () => {
    it('should return 0 for an empty array', () => {
      expect(DebtCalculatorHelper.calcularDeudaAnterior([])).toBe(0);
    });

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

    it('should return 0 when the preceding period is overpaid', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 60, abono: 100, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
      ];

      expect(DebtCalculatorHelper.calcularDeudaAnterior(prefacturas)).toBe(0);
    });
  });

  describe('calcularMesesAtrasado', () => {
    it('should return 0 for an empty array', () => {
      expect(DebtCalculatorHelper.calcularMesesAtrasado([])).toBe(0);
    });

    it('should not count periods where balance is fully paid', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 100, abono: 100, periodoId: 202601 },
        { totalPagar: 80, abono: 0, periodoId: 202602 },
        { totalPagar: 50, abono: 25, periodoId: 202603 },
      ];

      // 202601 pagado completo → no cuenta; 202602 y 202603 tienen saldo → 2
      expect(DebtCalculatorHelper.calcularMesesAtrasado(prefacturas)).toBe(2);
    });

    it('should not count periods with overpayment', () => {
      const prefacturas: IPrefacturaParaCalculo[] = [
        { totalPagar: 50, abono: 100, periodoId: 202601 },
      ];

      expect(DebtCalculatorHelper.calcularMesesAtrasado(prefacturas)).toBe(0);
    });
  });

  describe('saldoPendienteItem', () => {
    it('should return the pending balance for a partial payment', () => {
      const prefactura: IPrefacturaParaCalculo = {
        totalPagar: 100,
        abono: 30,
        periodoId: 202601,
      };

      expect(DebtCalculatorHelper.saldoPendienteItem(prefactura)).toBe(70);
    });

    it('should return 0 when the period is fully paid', () => {
      const prefactura: IPrefacturaParaCalculo = {
        totalPagar: 100,
        abono: 100,
        periodoId: 202601,
      };

      expect(DebtCalculatorHelper.saldoPendienteItem(prefactura)).toBe(0);
    });

    it('should return 0 for overpayment', () => {
      const prefactura: IPrefacturaParaCalculo = {
        totalPagar: 50,
        abono: 100,
        periodoId: 202601,
      };

      expect(DebtCalculatorHelper.saldoPendienteItem(prefactura)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const prefactura: IPrefacturaParaCalculo = {
        totalPagar: 100.336,
        abono: 0,
        periodoId: 202601,
      };

      expect(DebtCalculatorHelper.saldoPendienteItem(prefactura)).toBe(100.34);
    });
  });
});
