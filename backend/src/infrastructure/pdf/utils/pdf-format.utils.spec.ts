import {
  formatDate,
  formatMonthYear,
  formatCurrency,
  resolveClientName,
  buildRangoFechas,
  numberToWords,
  formatDateInWords,
} from './pdf-format.utils';

describe('pdf-format.utils', () => {
  describe('formatDate', () => {
    it('should format ISO date as DD/MM/YYYY', () => {
      expect(formatDate('2024-03-15T00:00:00.000Z')).toBe('15/03/2024');
    });

    it('should zero-pad day and month', () => {
      expect(formatDate('2024-01-05T00:00:00.000Z')).toBe('05/01/2024');
    });
  });

  describe('formatMonthYear', () => {
    it('should return month name and year in Spanish', () => {
      expect(formatMonthYear('2024-01-15T00:00:00.000Z')).toBe('enero de 2024');
    });

    it('should handle December correctly', () => {
      expect(formatMonthYear('2023-12-01T00:00:00.000Z')).toBe(
        'diciembre de 2023',
      );
    });
  });

  describe('formatCurrency', () => {
    it('should format to 2 decimal places', () => {
      expect(formatCurrency(100)).toBe('100.00');
      expect(formatCurrency(1.5)).toBe('1.50');
      expect(formatCurrency(0)).toBe('0.00');
    });

    it('should handle values with more than 2 decimals', () => {
      expect(formatCurrency(1.005)).toBe('1.00'); // JS float: 1.005 is actually 1.00499...
      expect(formatCurrency(1.999)).toBe('2.00');
    });
  });

  describe('resolveClientName', () => {
    it('should return razonSocial when present', () => {
      expect(
        resolveClientName({
          razonSocial: 'Empresa ABC',
          nombres: 'Juan',
          apellidos: 'Pérez',
        }),
      ).toBe('Empresa ABC');
    });

    it('should concatenate nombres and apellidos when razonSocial is null', () => {
      expect(
        resolveClientName({
          razonSocial: null,
          nombres: 'Juan',
          apellidos: 'Pérez',
        }),
      ).toBe('Juan Pérez');
    });

    it('should trim result when one field is missing', () => {
      expect(
        resolveClientName({
          razonSocial: null,
          nombres: 'Juan',
          apellidos: undefined,
        }),
      ).toBe('Juan');
    });

    it('should return empty string when all fields are missing', () => {
      expect(resolveClientName({})).toBe('');
    });
  });

  describe('buildRangoFechas', () => {
    it('should return fallback when both dates are null', () => {
      expect(buildRangoFechas(null, null)).toBe('Todos los registros');
    });

    it('should use custom fallback', () => {
      expect(buildRangoFechas(null, null, 'Todos los periodos')).toBe(
        'Todos los periodos',
      );
    });

    it('should return "Del X al Y" when both dates are present', () => {
      const result = buildRangoFechas('2024-01-01', '2024-03-31');
      expect(result).toMatch(/^Del .+ al .+/);
    });

    it('should return "Desde X" when only desde is present', () => {
      const result = buildRangoFechas('2024-01-01', null);
      expect(result).toMatch(/^Desde /);
    });

    it('should return "Hasta X" when only hasta is present', () => {
      const result = buildRangoFechas(null, '2024-03-31');
      expect(result).toMatch(/^Hasta /);
    });
  });

  describe('numberToWords', () => {
    it('should return "cero" for 0', () => {
      expect(numberToWords(0)).toBe('cero');
    });

    it('should handle single digits', () => {
      expect(numberToWords(1)).toBe('uno');
      expect(numberToWords(9)).toBe('nueve');
    });

    it('should handle tens', () => {
      expect(numberToWords(10)).toBe('diez');
      expect(numberToWords(20)).toBe('veinte');
      expect(numberToWords(31)).toBe('treinta y uno');
    });

    it('should handle hundreds', () => {
      expect(numberToWords(100)).toBe('cien');
      expect(numberToWords(200)).toBe('doscientos');
      expect(numberToWords(150)).toBe('ciento cincuenta');
    });

    it('should handle thousands', () => {
      expect(numberToWords(1000)).toBe('mil');
      expect(numberToWords(2000)).toBe('dos mil');
      expect(numberToWords(2024)).toBe('dos mil veinticuatro');
    });

    it('should handle negative numbers', () => {
      expect(numberToWords(-5)).toBe('menos cinco');
    });
  });

  describe('formatDateInWords', () => {
    it('should return date in written Spanish', () => {
      const result = formatDateInWords('2024-01-15T00:00:00.000Z');
      expect(result).toBe(
        'quince días del mes de enero del dos mil veinticuatro',
      );
    });

    it('should handle first day of month', () => {
      const result = formatDateInWords('2024-03-01T00:00:00.000Z');
      expect(result).toBe('uno días del mes de marzo del dos mil veinticuatro');
    });
  });
});
