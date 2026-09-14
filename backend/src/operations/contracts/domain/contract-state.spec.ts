import {
  CONTRACT_STATE_TRANSITIONS,
  canTransitionContractState,
} from './contract-state';

describe('contract-state', () => {
  it('allows documented transitions', () => {
    expect(canTransitionContractState('ORDEN_CORTE', 'SUSPENDIDO')).toBe(true);
    expect(canTransitionContractState('SUSPENDIDO', 'RECONEXION')).toBe(true);
    expect(canTransitionContractState('RECONEXION', 'ACTIVO')).toBe(true);
    expect(canTransitionContractState('ACTIVO', 'EN_MORA')).toBe(true);
    expect(canTransitionContractState('EN_MORA', 'EN_CONVENIO')).toBe(true);
  });

  it('rejects non-authorized transitions', () => {
    expect(canTransitionContractState('RETIRADO', 'ACTIVO')).toBe(false);
    expect(canTransitionContractState('SOLICITUD', 'ACTIVO')).toBe(false);
    expect(canTransitionContractState('ACTIVO', 'SOLICITUD')).toBe(false);
    expect(canTransitionContractState('SUSPENDIDO', 'ACTIVO')).toBe(false);
  });

  it('treats the same estado as a valid no-op transition', () => {
    expect(canTransitionContractState('ACTIVO', 'ACTIVO')).toBe(true);
  });

  it('rejects transitions from an unknown estado', () => {
    expect(canTransitionContractState('DESCONOCIDO', 'ACTIVO')).toBe(false);
  });

  it('marks RETIRADO as terminal', () => {
    expect(CONTRACT_STATE_TRANSITIONS.RETIRADO).toEqual([]);
  });
});
