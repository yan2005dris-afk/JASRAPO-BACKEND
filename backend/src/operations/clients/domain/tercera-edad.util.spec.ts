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

    it('retorna false con 64 años y 11 meses (cumple mañana)', () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() - 65);
      fecha.setDate(fecha.getDate() + 1);
      expect(TerceraEdadUtil.aplica(fecha.toISOString().slice(0, 10))).toBe(
        false,
      );
    });

    it('retorna true con 65 años justos (mismo día)', () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() - 65);
      expect(TerceraEdadUtil.aplica(fecha.toISOString().slice(0, 10))).toBe(
        true,
      );
    });

    it('usa el umbral recibido por parámetro en lugar del default', () => {
      const anio = new Date().getFullYear() - 62;
      // Con 62 años: no aplica con el default (65) pero sí con un umbral de 60.
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`)).toBe(false);
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`, 60)).toBe(true);
    });

    it('un umbral más alto excluye a quien calificaría con el default', () => {
      const anio = new Date().getFullYear() - 66;
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`)).toBe(true);
      expect(TerceraEdadUtil.aplica(`${anio}-01-01`, 70)).toBe(false);
    });
  });
});
