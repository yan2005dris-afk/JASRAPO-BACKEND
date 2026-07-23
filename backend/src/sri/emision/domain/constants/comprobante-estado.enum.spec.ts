import { ComprobanteEstado } from './comprobante-estado.enum';

describe('ComprobanteEstado', () => {
  it('should have BORRADOR state', () => {
    expect(ComprobanteEstado.BORRADOR).toBe('BORRADOR');
  });

  it('should have ENVIANDO state', () => {
    expect(ComprobanteEstado.ENVIANDO).toBe('ENVIANDO');
  });

  it('should have FIRMADO state', () => {
    expect(ComprobanteEstado.FIRMADO).toBe('FIRMADO');
  });

  it('should have AUTORIZADO state', () => {
    expect(ComprobanteEstado.AUTORIZADO).toBe('AUTORIZADO');
  });

  it('should have RECHAZADO state', () => {
    expect(ComprobanteEstado.RECHAZADO).toBe('RECHAZADO');
  });

  it('should have DEVUELTA state', () => {
    expect(ComprobanteEstado.DEVUELTA).toBe('DEVUELTA');
  });

  it('R-3/S1: should have POR_EMITIR state (sdd/sri-emision-modo-manual-automatico)', () => {
    expect(ComprobanteEstado.POR_EMITIR).toBe('POR_EMITIR');
  });

  it('should have PENDIENTE_CONTINGENCIA state (issue #201: SRI contingency mode)', () => {
    expect(ComprobanteEstado.PENDIENTE_CONTINGENCIA).toBe(
      'PENDIENTE_CONTINGENCIA',
    );
  });

  it('should contain exactly 8 states', () => {
    const values = Object.values(ComprobanteEstado);
    expect(values).toEqual([
      'BORRADOR',
      'ENVIANDO',
      'FIRMADO',
      'AUTORIZADO',
      'RECHAZADO',
      'DEVUELTA',
      'POR_EMITIR',
      'PENDIENTE_CONTINGENCIA',
    ]);
  });

  it('should be usable as a type', () => {
    const estado: ComprobanteEstado = 'BORRADOR';
    expect(estado).toBe('BORRADOR');
  });
});
