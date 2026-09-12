import { EstadoContrato } from 'src/shared/enums';

/**
 * State machine de contratos: define qué transiciones de estado son válidas.
 *
 * Transiciones con respaldo documental:
 *   - ORDEN_CORTE -> SUSPENDIDO al ejecutar el corte (SRS-JASRAPO).
 *   - SUSPENDIDO -> RECONEXION -> ACTIVO tras el pago o convenio (SRS-JASRAPO).
 *   - RETIRADO es terminal ("Terminado", SRS-JASRAPO).
 *
 * Las transiciones del alta (SOLICITUD -> PENDIENTE_PAGO ->
 * PENDIENTE_INSTALACION -> ACTIVO) y las de mora/convenio están PROPUESTAS a
 * partir del flujo existente y quedan PENDIENTES de confirmación explícita del
 * negocio (mismo criterio que ADR-004 y reading-state.ts).
 *
 * Solo se agregan transiciones explícitas. La ausencia de una transición
 * implica que no está permitida y será rechazada por canTransitionContractState().
 */
export const CONTRACT_STATE_TRANSITIONS: Record<string, string[]> = {
  [EstadoContrato.SOLICITUD]: [
    EstadoContrato.PENDIENTE_PAGO,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.PENDIENTE_PAGO]: [
    EstadoContrato.PENDIENTE_INSTALACION,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.PENDIENTE_INSTALACION]: [
    EstadoContrato.ACTIVO,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.ACTIVO]: [
    EstadoContrato.EN_MORA,
    EstadoContrato.ORDEN_CORTE,
    EstadoContrato.EN_CONVENIO,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.EN_MORA]: [
    EstadoContrato.ACTIVO,
    EstadoContrato.ORDEN_CORTE,
    EstadoContrato.EN_CONVENIO,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.ORDEN_CORTE]: [
    EstadoContrato.SUSPENDIDO,
    EstadoContrato.EN_CONVENIO,
    EstadoContrato.ACTIVO,
  ],
  [EstadoContrato.SUSPENDIDO]: [
    EstadoContrato.RECONEXION,
    EstadoContrato.EN_CONVENIO,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.EN_CONVENIO]: [
    EstadoContrato.ACTIVO,
    EstadoContrato.EN_MORA,
    EstadoContrato.RETIRADO,
  ],
  [EstadoContrato.RECONEXION]: [EstadoContrato.ACTIVO],
  [EstadoContrato.RETIRADO]: [],
};

export function canTransitionContractState(from: string, to: string): boolean {
  if (from === to) return true;
  return (CONTRACT_STATE_TRANSITIONS[from] ?? []).includes(to);
}
