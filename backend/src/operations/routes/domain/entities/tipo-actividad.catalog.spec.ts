import {
  CORE_TIPO_ACTIVIDAD_CODES,
  type TipoActividadCode,
} from 'src/shared/enums';

describe('TipoActividad catalog', () => {
  it('exposes the seeded core activity codes without the legacy reading name', () => {
    expect(CORE_TIPO_ACTIVIDAD_CODES).toEqual([
      'LECTURA',
      'INSPECCION',
      'INSTALACION',
      'CORTE',
      'RECONEXION',
    ] satisfies readonly TipoActividadCode[]);
    expect(CORE_TIPO_ACTIVIDAD_CODES).not.toContain('TOMA_LECTURA');
  });
});
