import {
  CORE_ACTIVITY_TYPE_CODES,
  type ActivityTypeCode,
} from 'src/shared/enums';

describe('ActivityType catalog', () => {
  it('exposes the seeded core activity codes without the legacy reading name', () => {
    expect(CORE_ACTIVITY_TYPE_CODES).toEqual([
      'LECTURA',
      'INSPECCION',
      'INSTALACION',
      'CORTE',
      'RECONEXION',
    ] satisfies readonly ActivityTypeCode[]);
    expect(CORE_ACTIVITY_TYPE_CODES).not.toContain('TOMA_LECTURA');
  });
});
