import { ContractState } from './contract-state';
import {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';

describe('ContractState', () => {
  it.each([
    EstadoServicioContrato.PENDIENTE_PAGO,
    EstadoServicioContrato.PENDIENTE_INSTALACION,
  ])('returns NO_APLICA for pending service %s', (estadoServicio) => {
    expect(
      ContractState.normalizeCollectionStatus(
        EstadoCobranzaContrato.EN_MORA,
        estadoServicio,
      ),
    ).toBe(EstadoCobranzaContrato.NO_APLICA);
  });

  it('preserves AL_DIA and EN_MORA for an active service', () => {
    expect(
      ContractState.normalizeCollectionStatus(
        EstadoCobranzaContrato.AL_DIA,
        EstadoServicioContrato.ACTIVO,
      ),
    ).toBe(EstadoCobranzaContrato.AL_DIA);
    expect(
      ContractState.normalizeCollectionStatus(
        EstadoCobranzaContrato.EN_MORA,
        EstadoServicioContrato.ACTIVO,
      ),
    ).toBe(EstadoCobranzaContrato.EN_MORA);
  });

  it('does not treat agreement presence as a contract state', () => {
    expect(EstadoCobranzaContrato).not.toHaveProperty('EN_CONVENIO');
    expect(
      ContractState.canTransitionCollectionStatus('AL_DIA', 'EN_MORA'),
    ).toBe(true);
  });
});
