import { normalizeContractProcedure } from './contract-procedure';

describe('Contract procedure', () => {
  it('keeps historical contracts without invented procedure details', () => {
    expect(normalizeContractProcedure({})).toEqual({});
  });
  it('clears stale representative data when the owner performs the procedure', () => {
    expect(
      normalizeContractProcedure({
        tramitadorEsTitular: true,
        tramitadorNombre: 'Old representative',
      }),
    ).toEqual({
      tramitadorEsTitular: true,
      tramitadorNombre: null,
      tramitadorIdentificacion: null,
      relacionTramitador: null,
    });
  });
  it('requires all representative details', () => {
    expect(() =>
      normalizeContractProcedure({
        tramitadorEsTitular: false,
        tramitadorNombre: 'Name',
      }),
    ).toThrow();
    expect(() =>
      normalizeContractProcedure({ tramitadorNombre: 'Name' }),
    ).toThrow();
    expect(() =>
      normalizeContractProcedure({ tramitadorEsTitular: null }),
    ).toThrow();
  });
  it('normalizes representative details and optional observations', () => {
    expect(
      normalizeContractProcedure({
        tramitadorEsTitular: false,
        tramitadorNombre: ' Ana ',
        tramitadorIdentificacion: ' ABC ',
        relacionTramitador: ' Familiar ',
        observacionesTramite: ' Nota ',
        otrasNovedades: ' ',
      }),
    ).toEqual({
      tramitadorEsTitular: false,
      tramitadorNombre: 'Ana',
      tramitadorIdentificacion: 'ABC',
      relacionTramitador: 'Familiar',
      observacionesTramite: 'Nota',
      otrasNovedades: null,
    });
  });
});
