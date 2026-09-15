import {
  EstadoCobranzaContrato,
  EstadoContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';
import { ContractState } from './contract-state';

describe('ContractState', () => {
  it('allows only the service lifecycle transitions', () => {
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.PENDIENTE_PAGO,
        EstadoServicioContrato.PENDIENTE_INSTALACION,
      ),
    ).toBe(true);
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.PENDIENTE_INSTALACION,
        EstadoServicioContrato.ACTIVO,
      ),
    ).toBe(true);
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.ACTIVO,
        EstadoServicioContrato.SUSPENDIDO,
      ),
    ).toBe(true);
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.SUSPENDIDO,
        EstadoServicioContrato.RETIRADO,
      ),
    ).toBe(true);
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.RETIRADO,
        EstadoServicioContrato.ACTIVO,
      ),
    ).toBe(false);
  });

  it('keeps collection status independent from service lifecycle', () => {
    expect(
      ContractState.canTransitionCollectionStatus(
        EstadoCobranzaContrato.EN_CONVENIO,
        EstadoCobranzaContrato.AL_DIA,
      ),
    ).toBe(true);
    expect(
      ContractState.canTransition(
        EstadoServicioContrato.ACTIVO,
        EstadoServicioContrato.ACTIVO,
      ),
    ).toBe(true);
  });

  it('provides a compatibility projection from the legacy mixed state', () => {
    expect(ContractState.fromLegacyState(EstadoContrato.ACTIVO)).toEqual({
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: EstadoCobranzaContrato.AL_DIA,
    });
    expect(ContractState.fromLegacyState(EstadoContrato.EN_CONVENIO)).toEqual({
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: EstadoCobranzaContrato.EN_CONVENIO,
    });
  });

  it('treats RETIRADO as terminal', () => {
    expect(ContractState.isTerminal(EstadoServicioContrato.RETIRADO)).toBe(
      true,
    );
    expect(ContractState.isTerminal(EstadoServicioContrato.SUSPENDIDO)).toBe(
      false,
    );
  });
});
