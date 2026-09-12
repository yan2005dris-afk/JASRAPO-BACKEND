import { TerceraEdadUtil } from './tercera-edad.util';

describe('TerceraEdadUtil', () => {
  describe('calcularEdad', () => {
    it('calcula la edad respecto a una fecha de referencia', () => {
      const nacimiento = new Date('1960-06-15');
      const referencia = new Date('2026-06-15');
      expect(TerceraEdadUtil.calcularEdad(nacimiento, referencia)).toBe(66);
    });

    it('no cuenta el año si el cumpleaños aún no ocurre en el año de referencia', () => {
      const nacimiento = new Date('1960-12-31');
      const referencia = new Date('2026-06-15');
      expect(TerceraEdadUtil.calcularEdad(nacimiento, referencia)).toBe(65);
    });
  });

  describe('aplica', () => {
    it('retorna true cuando la persona tiene 65 años o más', () => {
      const anio = new Date().getFullYear() - 70;
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`)).toBe(true);
    });

    it('retorna false cuando es menor de 65', () => {
      const anio = new Date().getFullYear() - 40;
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`)).toBe(false);
    });

    it('retorna false para valores vacíos o inválidos', () => {
      expect(TerceraEdadUtil.aplica(undefined)).toBe(false);
      expect(TerceraEdadUtil.aplica(null)).toBe(false);
      expect(TerceraEdadUtil.aplica('')).toBe(false);
      expect(TerceraEdadUtil.aplica('no-es-fecha')).toBe(false);
    });
  });
});
