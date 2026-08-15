import { DiscountEntity } from './discount.entity';

describe('DiscountEntity', () => {
  it('should create valid percentage discount and calculate discount amount', () => {
    const discount = DiscountEntity.create({
      id: 1,
      nombre: 'Descuento Tercera Edad',
      valor: 50,
      esPorcentaje: true,
      activo: true,
    });

    expect(discount).toBeInstanceOf(DiscountEntity);
    expect(discount.calcularDescuento(100)).toBe(50);
  });

  it('should create valid fixed amount discount and calculate discount amount', () => {
    const discount = DiscountEntity.create({
      id: 2,
      nombre: 'Descuento Fijo Subsidio',
      valor: 15,
      esPorcentaje: false,
      activo: true,
    });

    expect(discount.calcularDescuento(50)).toBe(15);
    expect(discount.calcularDescuento(10)).toBe(10);
  });

  it('should throw error when percentage is less than 0 or greater than 100', () => {
    expect(() => {
      new DiscountEntity({
        valor: -10,
        esPorcentaje: true,
      });
    }).toThrow('El valor del descuento en porcentaje debe estar entre 0 y 100');

    expect(() => {
      new DiscountEntity({
        valor: 150,
        esPorcentaje: true,
      });
    }).toThrow('El valor del descuento en porcentaje debe estar entre 0 y 100');
  });

  it('should throw error when fixed amount is less than or equal to 0', () => {
    expect(() => {
      new DiscountEntity({
        valor: 0,
        esPorcentaje: false,
      });
    }).toThrow('El valor del descuento fijo debe ser mayor a 0');
  });

  it('should support activation, deactivation, and updating values', () => {
    const discount = new DiscountEntity({
      id: 1,
      valor: 20,
      esPorcentaje: true,
      activo: true,
    });

    discount.desactivar();
    expect(discount.activo).toBe(false);
    expect(discount.calcularDescuento(100)).toBe(0);

    discount.activar();
    expect(discount.activo).toBe(true);

    discount.actualizarValor(30, true);
    expect(discount.valor).toBe(30);
    expect(discount.calcularDescuento(100)).toBe(30);
  });
});
