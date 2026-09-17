import {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';

const SERVICE_TRANSITIONS: Record<
  EstadoServicioContrato,
  readonly EstadoServicioContrato[]
> = {
  [EstadoServicioContrato.PENDIENTE_PAGO]: [
    EstadoServicioContrato.PENDIENTE_INSTALACION,
  ],
  [EstadoServicioContrato.PENDIENTE_INSTALACION]: [
    EstadoServicioContrato.ACTIVO,
  ],
  [EstadoServicioContrato.ACTIVO]: [EstadoServicioContrato.SUSPENDIDO],
  [EstadoServicioContrato.SUSPENDIDO]: [EstadoServicioContrato.RETIRADO],
  [EstadoServicioContrato.RETIRADO]: [],
};

export class ContractState {
  static canTransition(
    current: EstadoServicioContrato,
    next: EstadoServicioContrato,
  ): boolean {
    return (
      current === next || SERVICE_TRANSITIONS[current]?.includes(next) === true
    );
  }

  static canTransitionCollectionStatus(
    _current: EstadoCobranzaContrato,
    _next: EstadoCobranzaContrato,
  ): boolean {
    return true;
  }

  static isTerminal(state: EstadoServicioContrato): boolean {
    return state === EstadoServicioContrato.RETIRADO;
  }

  static normalizeCollectionStatus(
    value: unknown,
    estadoServicio: EstadoServicioContrato,
  ): EstadoCobranzaContrato {
    if (
      estadoServicio === EstadoServicioContrato.PENDIENTE_PAGO ||
      estadoServicio === EstadoServicioContrato.PENDIENTE_INSTALACION
    ) {
      return EstadoCobranzaContrato.NO_APLICA;
    }

    return value === EstadoCobranzaContrato.EN_MORA
      ? EstadoCobranzaContrato.EN_MORA
      : EstadoCobranzaContrato.AL_DIA;
  }
}
