import { LecturaEntity } from './lectura.entity';

describe('LecturaEntity', () => {
  it('should create a valid LecturaEntity instance and calculate consumo', () => {
    const lectura = LecturaEntity.create({
      lecturaId: BigInt(1),
      lecturaAnterior: 100,
      lecturaActual: 150,
      tieneAnomalia: false,
    });

    expect(lectura).toBeInstanceOf(LecturaEntity);
    expect(lectura.consumoCalculado).toBe(50);
  });

  it('should throw error when lecturaActual is less than lecturaAnterior', () => {
    expect(() => {
      new LecturaEntity({
        lecturaAnterior: 200,
        lecturaActual: 150,
      });
    }).toThrow('La lectura actual no puede ser menor a la lectura anterior');
  });

  it('should throw error when tieneAnomalia is true but descripcionAnomalia is empty', () => {
    expect(() => {
      new LecturaEntity({
        lecturaAnterior: 100,
        lecturaActual: 150,
        tieneAnomalia: true,
        descripcionAnomalia: '   ',
      });
    }).toThrow('Debe proporcionar una descripción si la lectura tiene anomalía');
  });

  it('should validate correctly when tieneAnomalia is true and descripcionAnomalia is provided', () => {
    const lectura = new LecturaEntity({
      lecturaAnterior: 100,
      lecturaActual: 150,
      tieneAnomalia: true,
      descripcionAnomalia: 'Medidor empañado',
    });

    expect(lectura.tieneAnomalia).toBe(true);
    expect(lectura.descripcionAnomalia).toBe('Medidor empañado');
  });

  it('should support domain methods: marcarAnomalia, validarLectura, y calcularConsumo', () => {
    const lectura = new LecturaEntity({
      lecturaId: BigInt(1),
      lecturaAnterior: 50,
      lecturaActual: 100,
    });

    lectura.marcarAnomalia('Fuga detectada');
    expect(lectura.tieneAnomalia).toBe(true);
    expect(lectura.descripcionAnomalia).toBe('Fuga detectada');

    lectura.validarLectura();
    expect(lectura.isValidada).toBe(true);
    expect(lectura.estado).toBe('VALIDADA');
    expect(lectura.fechaValidacion).toBeInstanceOf(Date);

    expect(lectura.calcularConsumo()).toBe(50);
  });
});
