import {
  EstadoCobranzaContrato,
  EstadoContrato,
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

  static fromLegacyState(legacyState: string): {
    estadoServicio: EstadoServicioContrato;
    estadoCobranza: EstadoCobranzaContrato;
  } {
    const estadoCobranza =
      legacyState === EstadoContrato.EN_MORA
        ? EstadoCobranzaContrato.EN_MORA
        : EstadoCobranzaContrato.AL_DIA;

    const estadoServicio =
      legacyState === EstadoContrato.PENDIENTE_INSTALACION
        ? EstadoServicioContrato.PENDIENTE_INSTALACION
        : legacyState === EstadoContrato.ACTIVO ||
            legacyState === EstadoContrato.EN_MORA ||
            legacyState === EstadoContrato.EN_CONVENIO
          ? EstadoServicioContrato.ACTIVO
          : legacyState === EstadoContrato.SUSPENDIDO ||
              legacyState === EstadoContrato.ORDEN_CORTE ||
              legacyState === EstadoContrato.RECONEXION
            ? EstadoServicioContrato.SUSPENDIDO
            : legacyState === EstadoContrato.RETIRADO
              ? EstadoServicioContrato.RETIRADO
              : EstadoServicioContrato.PENDIENTE_PAGO;

    return { estadoServicio, estadoCobranza };
  }

  /**
   * Normalizes values from pre-decoupling rows/callers without treating an
   * agreement marker as current-service debt.
   */
  static normalizeCollectionStatus(value: unknown): EstadoCobranzaContrato {
    return value === EstadoCobranzaContrato.EN_MORA
      ? EstadoCobranzaContrato.EN_MORA
      : EstadoCobranzaContrato.AL_DIA;
  }
}
